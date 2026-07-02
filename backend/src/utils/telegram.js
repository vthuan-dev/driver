const https = require('https');
const { User, WaitingRequest, Sequelize } = require('../models');
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

function formatRequestMessage(req, customStatusText = null) {
  const statusEmoji = req.status === 'waiting' ? '⏳ ĐANG CHỜ' :
                      req.status === 'matched' ? '✅ ĐÃ NHẬN CHUYẾN' : '🏁 ĐÃ HOÀN THÀNH';
  const statusText = customStatusText || statusEmoji;
  return `🚕 <b>YÊU CẦU CHUYẾN ĐI (TRIP REQUEST)</b>

<b>Mã YC:</b> ${req.id}
<b>Khách hàng:</b> ${req.name}
<b>Số điện thoại:</b> <code>${req.phone}</code>
<b>Lộ trình:</b> ${req.startPoint} ➡️ ${req.endPoint}
<b>Giá:</b> ${Number(req.price).toLocaleString('vi-VN')}đ
<b>Ghi chú:</b> ${req.note || 'Không có'}
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
    } else if (data.startsWith('delete_request_')) {
      const requestId = parseInt(data.substring('delete_request_'.length), 10);
      try {
        const req = await WaitingRequest.findByPk(requestId);
        if (!req) {
          await telegramApi('answerCallbackQuery', {
            callback_query_id: callbackQuery.id,
            text: '❌ Không tìm thấy yêu cầu này để xóa!',
            show_alert: true
          });
          return;
        }

        const reqId = req.id;
        const reqName = req.name;
        const reqPhone = req.phone;
        await req.destroy();

        await telegramApi('answerCallbackQuery', {
          callback_query_id: callbackQuery.id,
          text: `❌ Đã xóa yêu cầu chuyến đi mã #${reqId}!`,
          show_alert: false
        });

        const text = `🚕 <b>YÊU CẦU CHUYẾN ĐI (TRIP REQUEST)</b>

<b>Mã YC:</b> ${reqId}
<b>Khách hàng:</b> ${reqName}
<b>Số điện thoại:</b> <code>${reqPhone}</code>
<b>Trạng thái:</b> ❌ ĐÃ XÓA YÊU CẦU (Bởi Admin qua Telegram)`;

        await telegramApi('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: text,
          parse_mode: 'HTML'
        });
      } catch (err) {
        console.error('Telegram Bot: Error deleting request:', err);
        await telegramApi('answerCallbackQuery', {
          callback_query_id: callbackQuery.id,
          text: '❌ Có lỗi xảy ra khi xóa yêu cầu!',
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

        if (option === 'custom') {
          await telegramApi('answerCallbackQuery', {
            callback_query_id: callbackQuery.id,
            text: 'Hãy nhập số lượng...',
            show_alert: false
          });

          await telegramApi('editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text: '⌨️ Bạn đã chọn tự nhập số lượng.',
            parse_mode: 'HTML'
          });

          await telegramApi('sendMessage', {
            chat_id: chatId,
            text: '⌨️ Vui lòng phản hồi (reply) tin nhắn này và nhập số lượng tài khoản bạn muốn xem (Ví dụ: 15):',
            reply_markup: {
              force_reply: true,
              selective: true
            }
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
    let text = update.message.text.trim();
    const chatId = update.message.chat.id;
    console.log(`Telegram Bot: Received message "${text}" from chat ID: ${chatId}`);

    // Strip bot username suffix in group chats (e.g., /pending@duyetlaixebot -> /pending)
    if (text.includes('@')) {
      const parts = text.split('@');
      if (parts[1] && parts[1].toLowerCase() === 'duyetlaixebot') {
        text = parts[0];
      }
    }

    // Check if this message is a reply to manual number input prompt
    if (update.message.reply_to_message && 
        update.message.reply_to_message.text && 
        update.message.reply_to_message.text.includes('Vui lòng phản hồi (reply) tin nhắn này và nhập số lượng')) {
      
      try {
        const limit = parseInt(text, 10);
        const totalPending = await User.count({ where: { status: 'pending' } });

        if (isNaN(limit) || limit <= 0) {
          await telegramApi('sendMessage', {
            chat_id: chatId,
            text: '❌ Số lượng nhập không hợp lệ. Vui lòng phản hồi lại bằng một số nguyên dương.',
            parse_mode: 'HTML'
          });
          return;
        }

        if (totalPending === 0) {
          await telegramApi('sendMessage', {
            chat_id: chatId,
            text: '⏳ Hiện tại không có thành viên nào đang chờ duyệt.',
            parse_mode: 'HTML'
          });
          return;
        }

        const pendingUsers = await User.findAll({
          where: { status: 'pending' },
          order: [['createdAt', 'DESC']],
          limit: limit
        });

        await telegramApi('sendMessage', {
          chat_id: chatId,
          text: `🔍 Đang hiển thị <b>${pendingUsers.length}</b> trên tổng số <b>${totalPending}</b> thành viên chờ duyệt mới nhất:`,
          parse_mode: 'HTML'
        });

        for (const user of pendingUsers) {
          const textMsg = formatUserMessage(user);
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
            text: textMsg,
            parse_mode: 'HTML',
            reply_markup: replyMarkup
          });
        }
      } catch (err) {
        console.error('Telegram Bot: Error loading custom pending count:', err);
        await telegramApi('sendMessage', {
          chat_id: chatId,
          text: '❌ Đã xảy ra lỗi khi lấy danh sách chờ duyệt.',
          parse_mode: 'HTML'
        });
      }
      return;
    }

    if (text.startsWith('/find') || text.startsWith('/search')) {
      const match = text.match(/^\/(?:find|search)\s+(.+)$/);
      if (!match) {
        await telegramApi('sendMessage', {
          chat_id: chatId,
          text: '💡 <b>Cú pháp tìm kiếm:</b>\n<code>/find &lt;số điện thoại&gt;</code>\nVí dụ: <code>/find 0936008871</code>',
          parse_mode: 'HTML'
        });
        return;
      }

      const searchQuery = match[1].trim();
      try {
        const { Op } = Sequelize;
        
        // Find matching users (drivers)
        const users = await User.findAll({
          where: {
            phone: {
              [Op.like]: `%${searchQuery}%`
            }
          },
          limit: 5
        });

        // Find matching trip requests (WaitingRequest)
        const requests = await WaitingRequest.findAll({
          where: {
            phone: {
              [Op.like]: `%${searchQuery}%`
            }
          },
          limit: 5,
          order: [['createdAt', 'DESC']]
        });

        if (users.length === 0 && requests.length === 0) {
          await telegramApi('sendMessage', {
            chat_id: chatId,
            text: `🔍 Không tìm thấy tài khoản hoặc yêu cầu chuyến đi nào khớp với số điện thoại: <code>${searchQuery}</code>`,
            parse_mode: 'HTML'
          });
          return;
        }

        await telegramApi('sendMessage', {
          chat_id: chatId,
          text: `🔍 Kết quả tìm kiếm cho số điện thoại: <code>${searchQuery}</code> (Tìm thấy ${users.length} tài khoản lái xe, ${requests.length} yêu cầu chuyến đi):`,
          parse_mode: 'HTML'
        });

        // Send User results
        for (const user of users) {
          const textMsg = formatUserMessage(user);
          const buttons = [
            { text: '❌ Xóa tài khoản', callback_data: `delete_user_${user.id}` }
          ];
          if (user.status === 'pending') {
            buttons.unshift({ text: '✅ Duyệt', callback_data: `approve_user_${user.id}` });
          }
          
          await telegramApi('sendMessage', {
            chat_id: chatId,
            text: textMsg,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [buttons]
            }
          });
        }

        // Send Request results
        for (const req of requests) {
          const textMsg = formatRequestMessage(req);
          await telegramApi('sendMessage', {
            chat_id: chatId,
            text: textMsg,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '❌ Xóa yêu cầu', callback_data: `delete_request_${req.id}` }
                ]
              ]
            }
          });
        }
      } catch (err) {
        console.error('Telegram Bot: Error searching by phone:', err);
        await telegramApi('sendMessage', {
          chat_id: chatId,
          text: '❌ Có lỗi xảy ra trong quá trình tìm kiếm.',
          parse_mode: 'HTML'
        });
      }
      return;
    }

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
              { text: '20', callback_data: 'show_pending_20' }
            ],
            [
              { text: 'Tất cả', callback_data: 'show_pending_all' },
              { text: '⌨️ Tự nhập số', callback_data: 'show_pending_custom' }
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
      const helpText = `🤖 <b>HƯỚNG DẪN SỬ DỤNG BOT QUẢN LÝ LÁI XE</b>

Hệ thống Telegram Bot này hỗ trợ Admin theo dõi, duyệt và xóa các tài khoản lái xe mới đăng ký một cách nhanh chóng và trực quan.

📌 <b>Các tính năng chính:</b>

1️⃣ <b>Thông báo đăng ký mới tự động:</b>
• Mỗi khi có một lái xe mới đăng ký trên ứng dụng, hệ thống sẽ gửi một tin nhắn thông báo tự động chứa đầy đủ thông tin (Họ tên, SĐT, Loại xe, Năm sản xuất, Mật khẩu...).
• Bên dưới tin nhắn sẽ có hai nút bấm:
  - <code>[✅ Duyệt]</code>: Nhấn để kích hoạt ngay tài khoản đó.
  - <code>[❌ Xóa tài khoản]</code>: Nhấn để xóa vĩnh viễn tài khoản khỏi hệ thống.
• Sau khi nhấn, tin nhắn sẽ tự cập nhật trạng thái mới nhất và ẩn các nút bấm đi để đảm bảo tính an toàn.

2️⃣ <b>Xem danh sách chờ duyệt chủ động:</b>
• Gửi lệnh <b><code>/pending</code></b> hoặc <b><code>/list</code></b>.
• Bot sẽ hiển thị tổng số tài khoản đang chờ duyệt và hỏi bạn muốn hiển thị bao nhiêu người (5, 10, 20, Tất cả hoặc Tự nhập số).
• Nếu chọn <b>Tự nhập số</b>, hãy phản hồi (reply) tin nhắn yêu cầu của Bot bằng con số bạn mong muốn (Ví dụ: <code>15</code>).

3️⃣ <b>Tìm kiếm tài khoản & chuyến đi bằng SĐT:</b>
• Gửi lệnh <b><code>/find &lt;SĐT&gt;</code></b> hoặc <b><code>/search &lt;SĐT&gt;</code></b> (Ví dụ: <code>/find 0936008871</code>).
• Bot sẽ tìm kiếm tất cả tài khoản lái xe và yêu cầu chuyến đi của khách hàng liên quan đến số điện thoại đó, cho phép bạn duyệt hoặc xóa ngay lập tức.

📋 <b>Danh sách câu lệnh nhanh:</b>
• <code>/pending</code> hoặc <code>/list</code> : Xem danh sách tài khoản chưa duyệt.
• <code>/find &lt;SĐT&gt;</code> : Tìm kiếm tài khoản/yêu cầu bằng SĐT.
• <code>/help</code> hoặc <code>/start</code> : Xem hướng dẫn chi tiết này.`;

      await telegramApi('sendMessage', {
        chat_id: chatId,
        text: helpText,
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
  
  // Set bot commands suggestion for private chats (default)
  telegramApi('setMyCommands', {
    commands: [
      { command: 'pending', description: 'Xem danh sách lái xe đang chờ duyệt' },
      { command: 'find', description: 'Tìm kiếm tài khoản/yêu cầu bằng SĐT' },
      { command: 'help', description: 'Xem hướng dẫn sử dụng' }
    ]
  }).then(() => {
    console.log('Telegram Bot: Default commands suggestion set successfully.');
  }).catch(err => {
    console.error('Telegram Bot: Failed to set default commands suggestion:', err.message || err);
  });

  // Set bot commands suggestion for group chats
  telegramApi('setMyCommands', {
    commands: [
      { command: 'pending', description: 'Xem danh sách lái xe đang chờ duyệt' },
      { command: 'find', description: 'Tìm kiếm tài khoản/yêu cầu bằng SĐT' },
      { command: 'help', description: 'Xem hướng dẫn sử dụng' }
    ],
    scope: { type: 'all_group_chats' }
  }).then(() => {
    console.log('Telegram Bot: Group commands suggestion set successfully.');
  }).catch(err => {
    console.error('Telegram Bot: Failed to set group commands suggestion:', err.message || err);
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
