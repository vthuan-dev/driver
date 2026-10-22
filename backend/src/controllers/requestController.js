const { WaitingRequest, User, FakeNotification } = require('../models');

const createRequest = async (req, res) => {
  try {
    const { name, phone, startPoint, endPoint, price, note, region, driverPostId } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập bằng tài khoản đã đăng ký để tạo yêu cầu'
      });
    }

    const userId = req.user.id;
    const dbUser = await User.findByPk(userId);
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: 'Tài khoản không tồn tại'
      });
    }

    if (dbUser.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa'
      });
    }

    // Role check: admin can specify any phone (e.g., seeding/testing), normal users MUST use their registered phone
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const registeredPhone = (dbUser.phone || '').trim();

    if (!isAdmin) {
      // Validate phone strictly against registered phone
      if (phone && phone.trim() !== registeredPhone) {
        return res.status(400).json({
          success: false,
          message: `Số điện thoại đăng ký chờ cuốc phải đúng với số điện thoại tài khoản đã đăng ký (${registeredPhone})`
        });
      }
    }

    const finalPhone = isAdmin ? (phone ? phone.trim() : registeredPhone) : registeredPhone;
    const finalName = (name && name.trim()) ? name.trim() : dbUser.name;

    console.log('Creating request with data:', { name: finalName, phone: finalPhone, startPoint, endPoint, price, note, region, userId });
    
    const request = await WaitingRequest.create({
      userId,
      driverPostId: driverPostId ? parseInt(driverPostId) : null,
      name: finalName,
      phone: finalPhone,
      startPoint,
      endPoint,
      price: parseInt(price),
      note: note || '',
      region: ['north', 'central', 'south'].includes(region) ? region : 'north'
    });
    
    console.log('Request saved successfully:', request.toJSON());
    
    const data = request.toJSON();
    data._id = data.id;

    res.status(201).json({
      message: 'Request created successfully',
      request: data
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const allRequests = await WaitingRequest.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    
    const requests = allRequests.map(r => {
      const data = r.toJSON();
      data._id = data.id;
      return data;
    });

    res.json({ requests });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const { status, limit, region, province, keyword, search, from, to, page, all } = req.query;
    const { Op } = require('sequelize');

    const filter = {};
    if (status && ['waiting', 'matched', 'completed'].includes(String(status))) {
      filter.status = status;
    }
    if (region && ['north', 'central', 'south'].includes(String(region))) {
      filter.region = region;
    }

    const andClauses = [];
    if (from && String(from).trim()) {
      const f = String(from).trim();
      andClauses.push({
        startPoint: { [Op.like]: `%${f}%` }
      });
    }
    if (to && String(to).trim()) {
      const t = String(to).trim();
      andClauses.push({
        endPoint: { [Op.like]: `%${t}%` }
      });
    }
    if (!from && !to && province && String(province).trim()) {
      const p = String(province).trim();
      andClauses.push({
        [Op.or]: [
          { startPoint: { [Op.like]: `%${p}%` } },
          { endPoint:   { [Op.like]: `%${p}%` } }
        ]
      });
    }
    const qSearch = search || keyword;
    if (qSearch && String(qSearch).trim()) {
      const kw = String(qSearch).trim();
      andClauses.push({
        [Op.or]: [
          { name:       { [Op.like]: `%${kw}%` } },
          { phone:      { [Op.like]: `%${kw}%` } },
          { startPoint: { [Op.like]: `%${kw}%` } },
          { endPoint:   { [Op.like]: `%${kw}%` } }
        ]
      });
    }
    if (andClauses.length > 0) filter[Op.and] = andClauses;

    // Fast status counts for dashboard badges
    const [waitingCount, matchedCount, completedCount] = await Promise.all([
      WaitingRequest.count({ where: { status: 'waiting' } }),
      WaitingRequest.count({ where: { status: 'matched' } }),
      WaitingRequest.count({ where: { status: 'completed' } }),
    ]);

    const totalCount = waitingCount + matchedCount + completedCount;

    // If client explicitly requests all=true (for export, etc.)
    if (all === 'true' || all === '1') {
      const allRequests = await WaitingRequest.findAll({
        where: filter,
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'phone']
        }],
        order: [['createdAt', 'DESC']]
      });

      const requests = allRequests.map(r => {
        const data = r.toJSON();
        data._id = data.id;
        if (data.user) {
          data.userId = data.user;
        }
        return data;
      });

      return res.json({
        requests,
        pagination: {
          total: requests.length,
          page: 1,
          limit: requests.length,
          totalPages: 1
        },
        counts: {
          waiting: waitingCount,
          matched: matchedCount,
          completed: completedCount,
          total: totalCount
        }
      });
    }

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = parseInt(limit, 10);
    const pageLimit = parsedLimit > 0 ? Math.min(parsedLimit, 1000) : 500;
    const offset = (currentPage - 1) * pageLimit;

    const { count, rows } = await WaitingRequest.findAndCountAll({
      where: filter,
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'phone']
      }],
      order: [['createdAt', 'DESC']],
      limit: pageLimit,
      offset
    });

    const requests = rows.map(r => {
      const data = r.toJSON();
      data._id = data.id;
      if (data.user) {
        data.userId = data.user;
      }
      return data;
    });

    res.json({
      requests,
      pagination: {
        total: count,
        page: currentPage,
        limit: pageLimit,
        totalPages: Math.ceil(count / pageLimit) || 1
      },
      counts: {
        waiting: waitingCount,
        matched: matchedCount,
        completed: completedCount,
        total: totalCount
      }
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const request = await WaitingRequest.findByPk(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    await request.update({ status });
    
    // Fetch updated request with user
    const updatedRequest = await WaitingRequest.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['name', 'phone'] }]
    });

    const data = updatedRequest.toJSON();
    data._id = data.id;
    if (data.user) {
      data.userId = data.user;
    }

    res.json({
      message: 'Request updated successfully',
      request: data
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await WaitingRequest.findByPk(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    await request.destroy();
    
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getForDriver = async (req, res) => {
  try {
    const { driverPostId } = req.params;
    const requests = await WaitingRequest.findAll({
      where: { driverPostId: parseInt(driverPostId) },
      order: [['createdAt', 'DESC']]
    });
    const unreadCount = requests.filter(r => !r.isReadByDriver).length;
    res.json({ requests: requests.map(r => { const d = r.toJSON(); d._id = d.id; return d; }), unreadCount });
  } catch (error) {
    console.error('Get for driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const markReadByDriver = async (req, res) => {
  try {
    const { driverPostId } = req.params;
    await WaitingRequest.update(
      { isReadByDriver: true },
      { where: { driverPostId: parseInt(driverPostId), isReadByDriver: false } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createBulkRequests = async (req, res) => {
  try {
    const { requests, target = 'requests' } = req.body;
    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách cuốc xe không hợp lệ hoặc rỗng' });
    }

    let createdWaiting = [];
    let createdFake = [];

    // 1. Tạo vào WaitingRequest nếu target là 'requests' hoặc 'both'
    if (target === 'requests' || target === 'both') {
      const waitingData = requests.map(r => ({
        name: r.name?.trim() || 'Khách đặt xe',
        phone: r.phone?.trim() || '0988888888',
        startPoint: r.startPoint?.trim() || 'Hà Nội',
        endPoint: r.endPoint?.trim() || 'Hải Phòng',
        price: parseInt(r.price) || 500000,
        note: r.note?.trim() || '',
        region: ['north', 'central', 'south'].includes(r.region) ? r.region : 'north',
        status: 'waiting',
        userId: req.user ? req.user.id : null
      }));
      createdWaiting = await WaitingRequest.bulkCreate(waitingData);
    }

    // 2. Tạo vào FakeNotification nếu target là 'fake_notifications' hoặc 'both'
    if (target === 'fake_notifications' || target === 'both') {
      const now = new Date();
      const defaultTime = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
      // Chuẩn ISO YYYY-MM-DD để hiển thị ngày không bao giờ bị Invalid Date
      const defaultDate = now.toISOString().split('T')[0];

      const fakeData = requests.map(r => {
        let carType = '4';
        if (r.carType && ['4', '7', '16'].includes(String(r.carType))) {
          carType = String(r.carType);
        } else if (r.note && (r.note.includes('7 chỗ') || r.note.includes('5-7 chỗ'))) {
          carType = '7';
        } else if (r.note && r.note.includes('16 chỗ')) {
          carType = '16';
        }

        const startPt = r.startPoint?.trim() || 'Hà Nội';
        const endPt = r.endPoint?.trim() || 'Hải Phòng';
        const startArea = r.startArea?.trim() || startPt.split(',')[0].trim();
        const endArea = r.endArea?.trim() || endPt.split(',')[0].trim();
        const startDetail = r.startDetail?.trim() || startPt;
        const endDetail = r.endDetail?.trim() || endPt;

        // Chuẩn hóa displayDate nếu có dạng DD/MM/YYYY sang YYYY-MM-DD
        let dispDate = r.displayDate || defaultDate;
        if (dispDate && dispDate.includes('/')) {
          const parts = dispDate.split('/');
          if (parts.length === 3) {
            dispDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }

        return {
          region: ['north', 'central', 'south'].includes(r.region) ? r.region : 'north',
          startPoint: startPt,
          endPoint: endPt,
          startArea,
          endArea,
          startDetail,
          endDetail,
          displayTime: r.displayTime || defaultTime,
          displayDate: dispDate,
          carType,
          price: parseInt(r.price) || 500000,
          note: r.note?.trim() || null,
          isActive: true,
          createdById: req.user.id
        };
      });
      createdFake = await FakeNotification.bulkCreate(fakeData);
    }

    const totalCreated = (target === 'both') 
      ? (createdWaiting.length + createdFake.length)
      : (createdWaiting.length || createdFake.length);

    res.json({
      success: true,
      message: `Đã đăng thành công ${requests.length} cuốc xe lên hệ thống!`,
      data: {
        waitingCount: createdWaiting.length,
        fakeCount: createdFake.length,
        total: totalCreated
      }
    });
  } catch (error) {
    console.error('Error creating bulk requests:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi đăng cuốc hàng loạt: ' + error.message });
  }
};

module.exports = {
  createRequest,
  createBulkRequests,
  getMyRequests,
  getAllRequests,
  updateRequest,
  deleteRequest,
  getForDriver,
  markReadByDriver
};
