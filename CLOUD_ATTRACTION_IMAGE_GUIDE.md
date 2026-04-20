# 腾讯地点云景点图片配置指南

## 📋 概述

已为腾讯地点云API中的所有景点配置智能图片匹配系统。

## 🎯 工作原理

### 数据加载流程
```
1. 检查缓存（1小时内）
   ↓ 有缓存：直接使用
   ↓ 无缓存
2. 调用腾讯地点云API获取景点数据
   ↓
3. 为每个景点智能匹配图片
   ↓
4. 缓存到本地
```

### 图片匹配策略
- **优先级1**：使用云数据中的 `photo` 字段（如果存在）
- **优先级2**：使用智能图片匹配函数 `getAttractionImagesByName()`
- **默认值**：使用首页轮播图（`banner1`、`banner2`、`banner3`）

## 📸 已配置的景点

| 景点名称 | 图片键 | 云存储路径 |
|---------|--------|----------|
| 解放碑 | jiefangbei | images/jiefangbei.jpg |
| 洪崖洞 | hongyadong | images/hongyadong.jpg |
| 磁器口古镇 | ciqikou | images/ciqikouguzhen1.jpg |
| 长江索道 | changjiangsuodao | images/changjiangsuodao.jpg |
| 武隆天生三桥 | tianshengsanqiao | images/tianshengsanqiao.jpg |
| 李子坝轻轨站 | liziba | images/liziba.jpg |
| 南山一棵树 | nanshanyikeshu | images/nanshanyikeshu.jpg |
| 大足石刻 | dazushike | images/dazushiike1.jpg |
| 重庆动物园 | zoo | images/chongqinngdongwuyuan1.jpg |
| 重庆人民大礼堂 | renmindalitang | images/guanyinqiaobuxingjie1.jpg |
| 涪陵武陵山大裂谷 | wulingshandaliegu | images/chashanzhuhai1.jpg |
| 重庆科技馆 | kejiguan | images/sanxiaguangchang1.jpg |
| 白公馆 | baigongguan | images/shapingba1.webp |
| 歌乐山森林公园 | geleshan | images/elingerchangwenhuayuan1.jpg |
| 黔江濯水古镇 | zhuoshui | images/chashanzhuhai1.jpg |
| 万灵古镇 | wanlingguzhen | images/wanlingguzhen1.jpg |
| 茶山竹海 | chashanzhuhai | images/chashanzhuhai1.jpg |

## 🔧 添加新景点图片

### 方法1：添加到配置文件（推荐）

1. 在 `config/real-images.js` 的 `CLOUD_IMAGES` 中添加图片配置：

```javascript
const CLOUD_IMAGES = {
  // ... 其他图片

  // 新景点图片
  newattraction: 'cloud://.../images/newattraction1.jpg',
  newattraction1: 'cloud://.../images/newattraction2.jpg',
  newattraction2: 'cloud://.../images/newattraction3.jpg',
}
```

2. 在 `getAttractionImagesByName` 函数中添加名称映射：

```javascript
const nameToImageKey = {
  // ... 其他映射
  '新景点名称': 'newattraction'
}
```

### 方法2：使用云数据的photo字段

如果云数据中的景点已经有 `photo` 字段，会自动使用该图片，无需额外配置。

## 📁 文件修改清单

### 核心配置文件
- ✅ `config/real-images.js` - 添加茶山竹海图片配置和智能匹配函数
- ✅ `config/map.js` - 腾讯地图配置（已配置）

### 业务逻辑文件
- ✅ `app.js` - 云数据处理逻辑，调用智能图片匹配
- ✅ `pages/attraction-detail/attraction-detail.js` - 详情页图片加载逻辑

## 🎨 图片命名规则

云存储中的图片命名建议：
```
{景点名称}{序号}.jpg
```

示例：
- `chashanzhuhai1.jpg` - 茶山竹海第1张
- `chashanzhuhai2.jpg` - 茶山竹海第2张
- `chashanzhuhai3.jpg` - 茶山竹海第3张

## 🔄 清除缓存

如果图片没有更新，清除缓存：

```javascript
// 在微信开发者工具控制台执行
app.clearPlaceCloudCache()

// 或者
wx.removeStorageSync('placeCloudData')
wx.removeStorageSync('placeCloudDataTime')
```

然后点击 **编译** 按钮重新编译。

## 📊 智能匹配说明

`getAttractionImagesByName()` 函数支持：

### 1. 精确匹配
```javascript
'茶山竹海' → 'chashanzhuhai'
```

### 2. 部分匹配
```javascript
'茶山' → 'chashanzhuhai'
'竹海' → 'chashanzhuhai'
```

### 3. 反向匹配
```javascript
'chashanzhuhai' 匹配 '茶山竹海'
```

## 💡 注意事项

1. **图片源**：当前使用 `cloud` 模式，从云存储加载图片
2. **图片格式**：支持 jpg、webp 等格式
3. **缓存时间**：云数据缓存1小时，修改配置后需清除缓存
4. **权限设置**：云存储文件权限需设置为"所有用户可读"

## 🚀 扩展更多景点

如果腾讯地点云中有更多景点，只需：

1. 在 `nameToImageKey` 中添加名称映射
2. 在 `CLOUD_IMAGES` 中添加对应图片配置
3. 清除缓存重新加载

系统会自动为所有景点匹配图片！
