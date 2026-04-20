// app.js
const { IMAGES, getAttractionImagesByName } = require('./config/real-images')
const MAP_CONFIG = require('./config/map')

App({
  globalData: {
    userInfo: null,
    currentLocation: null,
    checkinPoints: [],
    userCheckins: [],
    isLoggedIn: false,
    phoneNumber: null,
    openId: null
  },
  onLaunch() {
    // 初始化云开发
    if (wx.cloud) {
      try {
        wx.cloud.init({
          env: 'cloudbase-3g97z2vs3386d03c',
          traceUser: true
        })
        console.log('云开发初始化成功，环境ID: cloudbase-3g97z2vs3386d03c')
      } catch (e) {
        console.warn('云开发初始化失败，将使用本地数据', e)
      }
    } else {
      console.warn('云开发功能不可用，将使用本地数据')
    }

    // 检查登录状态
    this.checkLoginStatus()

    // 获取位置信息（需要申请权限，暂时禁用）
    // this.getLocation()

    // 使用默认位置（重庆市中心 - 解放碑）
    this.globalData.currentLocation = {
      latitude: 29.563009,
      longitude: 106.551557
    }
  },
  
  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    const phoneNumber = wx.getStorageSync('phoneNumber')
    const openId = wx.getStorageSync('openId')
    
    if (userInfo && openId) {
      this.globalData.userInfo = userInfo
      this.globalData.phoneNumber = phoneNumber
      this.globalData.openId = openId
      this.globalData.isLoggedIn = true
    }
  },

  // 检查登录状态，未登录则提示并返回true/false
  checkLogin() {
    if (this.globalData.isLoggedIn) {
      return true
    }
    wx.showModal({
      title: '提示',
      content: '该功能需要登录后才能使用，是否前往登录？',
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // mine是tabBar页面，需要使用switchTab
          wx.switchTab({
            url: '/pages/mine/mine'
          })
        }
      }
    })
    return false
  },

  // 快速提示登录（不跳转）
  showLoginTip() {
    wx.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 2000
    })
  },
  
  // 微信一键登录
  wxLogin() {
    return new Promise((resolve, reject) => {
      // 直接使用默认用户,不调用getUserProfile
      wx.login({
        success: res => {
          console.log('wx.login成功:', res)

          // 使用默认用户
          const defaultUserInfo = {
            nickName: '旅行者',
            avatarUrl: '',
            gender: 0,
            language: 'zh_CN',
            city: '',
            province: '',
            country: 'CN'
          }
          const openId = 'wx_' + Math.random().toString(36).substr(2, 15)

          this.globalData.userInfo = defaultUserInfo
          this.globalData.openId = openId
          this.globalData.isLoggedIn = true

          wx.setStorageSync('userInfo', defaultUserInfo)
          wx.setStorageSync('openId', openId)

          resolve({
            success: true,
            userInfo: defaultUserInfo,
            openId: openId
          })
        },
        fail: err => {
          console.error('wx.login失败:', err)
          // 即使wx.login失败也使用默认用户
          const defaultUserInfo = {
            nickName: '旅行者',
            avatarUrl: '',
            gender: 0,
            language: 'zh_CN',
            city: '',
            province: '',
            country: 'CN'
          }
          const openId = 'wx_' + Math.random().toString(36).substr(2, 15)

          this.globalData.userInfo = defaultUserInfo
          this.globalData.openId = openId
          this.globalData.isLoggedIn = true

          wx.setStorageSync('userInfo', defaultUserInfo)
          wx.setStorageSync('openId', openId)

          resolve({
            success: true,
            userInfo: defaultUserInfo,
            openId: openId
          })
        }
      })
    })
  },
  
  // 获取手机号（需要后端支持）
  getPhoneNumber(e) {
    return new Promise((resolve, reject) => {
      if (e.detail.errMsg === 'getPhoneNumber:ok') {
        // 获取到加密数据，需要发送到后端解密
        const encryptedData = e.detail.encryptedData
        const iv = e.detail.iv
        
        // 模拟手机号（实际应该发送到后端解密）
        const phoneNumber = '138****8888'
        
        this.globalData.phoneNumber = phoneNumber
        wx.setStorageSync('phoneNumber', phoneNumber)
        
        resolve({
          success: true,
          phoneNumber: phoneNumber
        })
      } else {
        reject({
          success: false,
          message: '用户拒绝授权手机号'
        })
      }
    })
  },
  
  // 保存用户手动输入的手机号
  savePhoneNumber(phoneNumber) {
    return new Promise((resolve, reject) => {
      if (!phoneNumber) {
        reject({ success: false, message: '手机号不能为空' })
        return
      }
      
      // 验证手机号格式
      if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
        reject({ success: false, message: '手机号格式不正确' })
        return
      }
      
      // 保存手机号
      this.globalData.phoneNumber = phoneNumber
      wx.setStorageSync('phoneNumber', phoneNumber)
      
      resolve({
        success: true,
        phoneNumber: phoneNumber
      })
    })
  },
  
  // 退出登录
  logout() {
    this.globalData.userInfo = null
    this.globalData.phoneNumber = null
    this.globalData.openId = null
    this.globalData.isLoggedIn = false
    
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('phoneNumber')
    wx.removeStorageSync('openId')
    
    return { success: true }
  },
  
  // 获取用户位置（需要申请权限，暂时禁用）
  getLocation() {
    wx.getLocation({
      type: 'wgs84',
      success: res => {
        this.globalData.currentLocation = {
          latitude: res.latitude,
          longitude: res.longitude
        }
      },
      fail: err => {
        console.error('获取位置失败:', err)
      }
    })
    // console.log('位置功能需要申请权限，使用默认位置')
  },
  
  // 计算两点之间的距离
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 地球半径（米）
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  },
  
  // 模拟数据：重庆市打卡点列表
  getCheckinPoints() {
    return [
      {
        id: 1,
        name: '解放碑',
        type: '地标',
        latitude: 29.563009,
        longitude: 106.551557,
        address: '重庆市渝中区民族路177号',
        distance: 0,
        checked: false,
        description: '重庆最著名的地标建筑，是中国唯一一座纪念中华民族抗日战争胜利的纪念碑。',
        openTime: '全天开放',
        fee: '免费',
        image: IMAGES.jiefangbei,
        colorClass: 'jiefangbei-color'
      },
      {
        id: 2,
        name: '洪崖洞',
        type: '特色建筑',
        latitude: 29.563219,
        longitude: 106.578149,
        address: '重庆市渝中区嘉陵江滨江路88号',
        distance: 1500,
        checked: false,
        description: '重庆最具特色的吊脚楼建筑群，夜晚灯光璀璨，是重庆夜景的代表。',
        openTime: '全天开放',
        fee: '免费',
        image: IMAGES.hongyadong,
        colorClass: 'hongyadong-color'
      },
      {
        id: 3,
        name: '磁器口古镇',
        type: '古镇',
        latitude: 29.583095,
        longitude: 106.454983,
        address: '重庆市沙坪坝区磁器口街道',
        distance: 8500,
        checked: false,
        description: '千年古镇，重庆古城的缩影和象征，以出产瓷器而得名。',
        openTime: '全天开放',
        fee: '免费',
        image: IMAGES.ciqikou,
        colorClass: 'ciqikou-color'
      },
      {
        id: 4,
        name: '长江索道',
        type: '交通工具',
        latitude: 29.563878,
        longitude: 106.586416,
        address: '重庆市渝中区新华路151号',
        distance: 2000,
        checked: false,
        description: '被誉为"万里长江第一条空中走廊"，是重庆独特的城市交通方式。',
        openTime: '07:30-22:30',
        fee: '20元',
        image: IMAGES.changjiangsuodao,
        colorClass: 'changjiangsuodao-color'
      },
      {
        id: 5,
        name: '武隆天生三桥',
        type: '自然景观',
        latitude: 29.431586,
        longitude: 107.794237,
        address: '重庆市武隆区仙女山镇',
        distance: 180000,
        checked: false,
        description: '世界自然遗产，亚洲最大的天生桥群，电影《变形金刚4》取景地。',
        openTime: '08:00-17:00',
        fee: '125元',
        image: IMAGES.tianshengsanqiao,
        colorClass: 'wulong-color'
      },
      {
        id: 6,
        name: '李子坝轻轨站',
        type: '网红打卡',
        latitude: 29.556486,
        longitude: 106.529578,
        address: '重庆市渝中区李子坝正街62号',
        distance: 3200,
        checked: false,
        description: '轻轨穿楼而过的奇观，是重庆8D魔幻城市的代表性景观。',
        openTime: '06:30-23:00',
        fee: '2元起',
        image: IMAGES.liziba,
        colorClass: 'liziba-color'
      },
      {
        id: 7,
        name: '南山一棵树',
        type: '观景台',
        latitude: 29.538095,
        longitude: 106.586416,
        address: '重庆市南岸区龙黄公路',
        distance: 5600,
        checked: false,
        description: '观赏重庆夜景的最佳地点，可以俯瞰整个渝中半岛。',
        openTime: '09:00-22:30',
        fee: '30元',
        image: IMAGES.nanshanyikeshu,
        colorClass: 'nanshan-color'
      },
      {
        id: 8,
        name: '大足石刻',
        type: '文化古迹',
        latitude: 29.705864,
        longitude: 105.779383,
        address: '重庆市大足区宝顶镇',
        distance: 95000,
        checked: false,
        description: '世界文化遗产，中国晚期石窟艺术的代表作。',
        openTime: '08:30-18:00',
        fee: '140元',
        image: IMAGES.dazushike,
        colorClass: 'dazu-color'
      },
      {
        id: 9,
        name: '重庆动物园',
        type: '动物园',
        latitude: 29.526789,
        longitude: 106.526456,
        address: '重庆市九龙坡区西郊路',
        distance: 8500,
        checked: false,
        description: '重庆最大的动物园，拥有大熊猫、金丝猫等珍稀动物。',
        openTime: '08:30-17:30',
        fee: '25元',
        image: IMAGES.zoo,
        colorClass: 'zoo-color'
      },
      {
        id: 10,
        name: '重庆人民大礼堂',
        type: '地标建筑',
        latitude: 29.566789,
        longitude: 106.556456,
        address: '重庆市渝中区人民路',
        distance: 2000,
        checked: false,
        description: '重庆标志性建筑之一，是中国传统建筑风格的代表。',
        openTime: '09:00-17:00',
        fee: '10元',
        image: IMAGES.renmindalitang,
        colorClass: 'dajitang-color'
      },
      {
        id: 11,
        name: '涪陵武陵山大裂谷',
        type: '自然景观',
        latitude: 29.786789,
        longitude: 107.456456,
        address: '重庆市涪陵区武陵乡',
        distance: 120000,
        checked: false,
        description: '中国最古老的峡谷之一，以"雄、奇、险、幽"著称。',
        openTime: '08:00-18:00',
        fee: '120元',
        image: IMAGES.wulingshandaliegu,
        colorClass: 'wuling-color'
      },
      {
        id: 12,
        name: '重庆科技馆',
        type: '科技馆',
        latitude: 29.586789,
        longitude: 106.566456,
        address: '重庆市江北区江北城',
        distance: 6000,
        checked: false,
        description: '重庆最大的科技馆，集科普教育、娱乐休闲于一体。',
        openTime: '09:30-17:00',
        fee: '免费',
        image: IMAGES.kejiguan,
        colorClass: 'kejiguan-color'
      },
      {
        id: 13,
        name: '白公馆',
        type: '历史遗迹',
        latitude: 29.556789,
        longitude: 106.506456,
        address: '重庆市沙坪坝区歌乐山',
        distance: 15000,
        checked: false,
        description: '抗战时期的重要历史遗迹，见证了那段峥嵘岁月。',
        openTime: '09:00-17:00',
        fee: '免费',
        image: IMAGES.baigongguan,
        colorClass: 'baigongguan-color'
      },
      {
        id: 14,
        name: '歌乐山森林公园',
        type: '森林公园',
        latitude: 29.556789,
        longitude: 106.496456,
        address: '重庆市沙坪坝区歌乐山镇',
        distance: 16000,
        checked: false,
        description: '重庆近郊的天然氧吧，森林覆盖率达95%以上。',
        openTime: '07:00-19:00',
        fee: '免费',
        image: IMAGES.geleshan,
        colorClass: 'geleshan-color'
      },
      {
        id: 15,
        name: '黔江濯水古镇',
        type: '古镇',
        latitude: 29.286789,
        longitude: 108.776456,
        address: '重庆市黔江区濯水镇',
        distance: 250000,
        checked: false,
        description: '千年古镇，有着浓郁的土家族和苗族风情，是体验巴渝文化的绝佳去处。',
        openTime: '全天开放',
        fee: '免费',
        image: IMAGES.zhuoshui,
        colorClass: 'zhuoshui-color'
      },
      {
        id: 16,
        name: '万灵古镇',
        type: '古镇',
        latitude: 29.426789,
        longitude: 105.826456,
        address: '重庆市荣昌区万灵镇',
        distance: 85000,
        checked: false,
        description: '重庆市级历史文化名镇，拥有明清时期的古建筑群和独特的巴渝文化风情。',
        openTime: '全天开放',
        fee: '免费',
        image: IMAGES.wanlingguzhen,
        colorClass: 'wanling-color'
      },
      {
        id: 17,
        name: '铜元局轻轨站',
        type: '网红打卡',
        latitude: 29.526789,
        longitude: 106.516456,
        address: '重庆市南岸区铜元局',
        distance: 8000,
        checked: false,
        description: '重庆独特的轻轨观景台，可以欣赏到山城的壮丽景色。',
        openTime: '全天开放',
        fee: '免费',
        image: IMAGES.tongyuanjuqingguizhan,
        colorClass: 'default-color'
      }
    ]
  },
  
  // 模拟数据：用户打卡历史
  getUserCheckins() {
    return [
      {
        id: 1,
        pointId: 2,
        pointName: '洪崖洞',
        checkinTime: '2026-03-23 14:30',
        image: IMAGES.banner2
      },
      {
        id: 2,
        pointId: 3,
        pointName: '磁器口古镇',
        checkinTime: '2026-03-22 10:15',
        image: IMAGES.banner3
      },
      {
        id: 3,
        pointId: 1,
        pointName: '解放碑',
        checkinTime: '2026-03-21 16:00',
        image: IMAGES.banner1
      },
      {
        id: 4,
        pointId: 6,
        pointName: '李子坝轻轨站',
        checkinTime: '2026-03-20 09:45',
        image: '/images/banner2.jpg'
      }
    ]
  },
  
  // 模拟数据：用户动态
  getUserPosts() {
    return [
      {
        id: 1,
        userId: 101,
        userName: '重庆旅行者',
        avatar: IMAGES.banner3,
        content: '今天参观了解放碑，感受到了重庆这座城市的魅力！夜景真的很美～',
        images: ['cloud://cloudbase-3g97z2vs3386d03c.636c-cloudbase-3g97z2vs3386d03c-1389722148/images/jiefangbei000.jpg'],
        location: '解放碑',
        time: '2026-03-24 09:30',
        likes: 45,
        comments: 12,
        liked: false
      },
      {
        id: 2,
        userId: 102,
        userName: '美食达人',
        avatar: IMAGES.banner2,
        content: '磁器口的古镇风情让人流连忘返，特色小吃也太好吃了！',
        images: [IMAGES.ciqikou],
        location: '磁器口古镇',
        time: '2026-03-23 16:45',
        likes: 67,
        comments: 18,
        liked: false
      },
      {
        id: 3,
        userId: 103,
        userName: '摄影爱好者',
        avatar: IMAGES.banner3,
        content: '长江索道的日落风景绝美，从空中俯瞰重庆两江交汇，太震撼了！',
        images: [IMAGES.changjiangsuodao],
        location: '长江索道',
        time: '2026-03-23 12:30',
        likes: 89,
        comments: 22,
        liked: false
      },
      {
        id: 4,
        userId: 104,
        userName: '文化探索者',
        avatar: IMAGES.banner1,
        content: '武隆天生三桥的奇石景观令人叹为观止，大自然的鬼斧神工！',
        images: [IMAGES.tianshengsanqiao],
        location: '武隆天生三桥',
        time: '2026-03-22 15:20',
        likes: 56,
        comments: 15,
        liked: false
      }
    ]
  },

  // 地点云API调用
  getPlaceCloudData() {
    return new Promise((resolve, reject) => {
      const cachedData = wx.getStorageSync('placeCloudData')
      const cacheTime = wx.getStorageSync('placeCloudDataTime')
      const now = Date.now()
      
      if (cachedData && (now - cacheTime < 3600000)) {
        console.log('使用缓存的地点云数据')
        resolve(cachedData)
        return
      }

      if (!MAP_CONFIG.KEY || MAP_CONFIG.KEY === 'YOUR_TENCENT_MAP_KEY') {
        resolve(this.getCheckinPoints())
        return
      }

      wx.request({
        url: MAP_CONFIG.PLACE_CLOUD.DATA_LIST,
        method: 'GET',
        data: {
          key: MAP_CONFIG.KEY,
          table_id: MAP_CONFIG.PLACE_CLOUD.TABLE_ID,
          orderby: 'id desc',
          page_size: 200,
          page_index: 1
        },
        success: res => {
          console.log('地点云API响应 status:', res.data.status)
          if (res.data.status === 0) {
            const resultData = res.data.result?.data || res.data.data || []
            console.log('解析到的数据条数:', resultData.length)
            if (resultData.length === 0) {
              console.warn('地点云数据为空，使用模拟数据')
              resolve(this.getCheckinPoints())
              return
            }
            try {
              const points = resultData.map(item => {
                // 智能匹配景点图片
                const attractionImages = getAttractionImagesByName(item.title || '')
                const mainImage = attractionImages[0]

                // 清理图片路径
                let photoImage = item.photo || ''
                // 如果photo字段包含云存储路径但前面有错误的前缀，进行清理
                if (photoImage && photoImage.includes('cloud://')) {
                  photoImage = photoImage.substring(photoImage.indexOf('cloud://'))
                  console.log('清理图片路径:', item.photo, '->', photoImage)
                }

                return {
                  id: item.id,
                  name: item.title,
                  type: item.category || '景点',
                  latitude: item.location?.lat || 0,
                  longitude: item.location?.lng || 0,
                  address: item.address || '',
                  distance: 0,
                  checked: false,
                  description: item.address || item.title,
                  openTime: '全天开放',
                  fee: '免费',
                  // 优先使用云数据中的图片（已清理），如果没有则使用智能匹配的图片
                  image: photoImage || mainImage || IMAGES.banner1,
                  colorClass: 'default-color'
                }
              })
              wx.setStorageSync('placeCloudData', points)
              wx.setStorageSync('placeCloudDataTime', now)
              resolve(points)
            } catch (e) {
              console.error('解析地点云数据失败:', e)
              resolve(this.getCheckinPoints())
            }
          } else {
            console.error('地点云API调用失败:', res.data.message, 'status:', res.data.status)
            resolve(this.getCheckinPoints())
          }
        },
        fail: err => {
          console.error('地点云API请求失败:', err)
          resolve(this.getCheckinPoints())
        }
      })
    })
  },

  // 清除地点云数据缓存
  clearPlaceCloudCache() {
    wx.removeStorageSync('placeCloudData')
    wx.removeStorageSync('placeCloudDataTime')
    console.log('地点云数据缓存已清除')
  },

  // 通过IP获取位置
  getLocationByIP() {
    return new Promise((resolve, reject) => {
      // 检查是否配置了API密钥
      if (!MAP_CONFIG.KEY || MAP_CONFIG.KEY === 'YOUR_TENCENT_MAP_KEY') {
        resolve(null)
        return
      }

            wx.request({
        // 👇 这行必须是这个地址，不能写错！
        url: 'https://apis.map.qq.com/ws/place/v1/search',
        data: {
          keyword: "餐厅",
          boundary: "nearby(纬度,经度,1000)",
          key: "你的腾讯位置服务KEY"
        },
        success: res => {
          console.log("成功:", res.data)
          if (res.data.status === 0) {
            // 成功处理
          } else {
            console.error("失败原因:", res.data.message)
          }
        },
        fail: err => {
          console.error("请求失败:", err)
        }
      })
    })
  },

  // 清除地点云数据缓存
  clearPlaceCloudCache() {
    wx.removeStorageSync('placeCloudData')
    wx.removeStorageSync('placeCloudDataTime')
    console.log('已清除地点云数据缓存')
  }
})