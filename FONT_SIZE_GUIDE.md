# 字体大小功能使用指南

## 功能概述

重庆文旅打卡小程序现在支持全局字体大小设置，用户可以在设置页面选择适合自己的字体大小：小(14px)、默认(16px)、中(18px)、大(20px)。设置会应用到整个小程序的所有页面。

## 实现原理

### 1. 全局配置

字体大小设置保存在 `appSettings` 存储中，包含以下选项：
- 14: 小 (font-size-small, 24rpx)
- 16: 默认 (font-size-normal, 28rpx) 
- 18: 中 (font-size-medium, 32rpx)
- 20: 大 (font-size-large, 36rpx)

### 2. 工具函数

位置：`utils/font-size.js`

主要功能：
- `getFontSizeConfig(fontSize)`: 获取字体大小配置
- `getFontSizeClass(fontSize, isTitle)`: 获取字体大小类名
- `scaleByFontSize(value, fontSize)`: 根据字体大小缩放数值
- `applyFontSizeToPage(pageInstance, fontSize)`: 在页面中应用字体大小
- `getStoredFontSize()`: 获取存储的字体大小设置

### 3. 全局样式

在 `app.wxss` 中定义了字体大小相关的 CSS 类：

```css
/* 字体大小类 - 基础文本 */
.font-size-small { font-size: 24rpx !important; }
.font-size-normal { font-size: 28rpx !important; }
.font-size-medium { font-size: 32rpx !important; }
.font-size-large { font-size: 36rpx !important; }

/* 标题字体大小 */
.font-size-title-small { font-size: 32rpx !important; }
.font-size-title-normal { font-size: 36rpx !important; }
.font-size-title-medium { font-size: 40rpx !important; }
.font-size-title-large { font-size: 44rpx !important; }
```

## 如何在页面中应用字体大小

### 方法 1: 使用工具函数（推荐）

在页面的 JS 文件中：

```javascript
// 引入工具函数
const fontUtil = require('../../utils/font-size')

Page({
  data: {
    fontSizeClass: 'font-size-normal',
    titleFontSizeClass: 'font-size-title-normal'
  },

  onLoad() {
    // 应用字体大小设置
    fontUtil.applyFontSizeToPage(this, fontUtil.getStoredFontSize())
  },

  onShow() {
    // 页面显示时重新应用字体大小（从设置页面返回时）
    fontUtil.applyFontSizeToPage(this, fontUtil.getStoredFontSize())
  }
})
```

在页面的 WXML 文件中：

```xml
<view class="page {{fontSizeClass}}">
  <text class="title {{titleFontSizeClass}}">标题</text>
  <text class="content {{fontSizeClass}}">内容文本</text>
</view>
```

### 方法 2: 直接读取设置

```javascript
Page({
  data: {
    fontSizeClass: 'font-size-normal'
  },

  onLoad() {
    // 读取字体设置
    const settings = wx.getStorageSync('appSettings') || {}
    const fontSize = settings.fontSize || 16
    
    // 手动设置类名
    this.setData({
      fontSizeClass: fontSize === 14 ? 'font-size-small' : 
                   fontSize === 16 ? 'font-size-normal' :
                   fontSize === 18 ? 'font-size-medium' : 
                   'font-size-large'
    })
  }
})
```

## 已实现字体大小功能的页面

### 1. 设置页面 (pages/settings/settings)

- ✅ 完整的字体大小选择功能
- ✅ 实时预览字体大小效果
- ✅ 保存和加载设置
- ✅ 应用到全局设置

### 2. 首页 (pages/index/index)

- ✅ 应用字体大小到页面内容
- ✅ 动态调整文字大小

### 3. 字体测试页面 (pages/font-test/font-test)

- ✅ 专门的字体测试页面
- ✅ 实时显示当前字体大小
- ✅ 多种文字大小示例
- ✅ 实际应用场景演示

## 实现说明

### 在其他页面中添加字体大小支持

只需按以下步骤操作：

1. **引入工具函数**
   ```javascript
   const fontUtil = require('../../utils/font-size')
   ```

2. **添加数据字段**
   ```javascript
   data: {
     fontSizeClass: 'font-size-normal',
     titleFontSizeClass: 'font-size-title-normal'
   }
   ```

3. **在 onLoad 中应用字体大小**
   ```javascript
   onLoad() {
     fontUtil.applyFontSizeToPage(this, fontUtil.getStoredFontSize())
   }
   ```

4. **在 onShow 中重新应用字体大小**（重要）
   ```javascript
   onShow() {
     fontUtil.applyFontSizeToPage(this, fontUtil.getStoredFontSize())
   }
   ```

5. **在 WXML 中使用类名**
   ```xml
   <view class="page {{fontSizeClass}}">
     <text class="title {{titleFontSizeClass}}">页面标题</text>
     <text class="content {{fontSizeClass}}">普通文本</text>
   </view>
   ```

## 特性说明

1. **全局一致性**: 字体大小设置在小程序内全局生效
2. **持久化存储**: 设置会保存在本地，下次打开应用时保持
3. **动态更新**: 修改设置后，页面返回时会自动应用新设置
4. **重要性优先**: 使用 `!important` 确保字体大小设置优先级

## 测试方法

### 1. 通过设置页面测试

1. 打开小程序，进入"我的" → "设置"
2. 在"显示设置"中选择"字体大小"
3. 选择不同的字体大小（小/默认/中/大）
4. 观察设置页面的文字大小变化
5. 返回其他页面查看字体大小是否生效

### 2. 通过字体测试页面测试

1. 进入"设置" → "字体测试"
2. 查看当前字体大小显示
3. 点击"去设置页面修改字体大小"
4. 修改字体大小后返回
5. 对比修改前后的效果

### 3. 在其他页面测试

在实现了字体大小功能的页面中：
1. 修改字体大小设置
2. 返回到该页面
3. 检查文字大小是否正确变化

## 注意事项

1. **图片和图标**: 字体大小设置不直接影响图片和图标大小，如需要需额外处理
2. **布局影响**: 字体大小变化可能影响页面布局，建议测试不同字体大小下的显示效果
3. **性能考虑**: 避免频繁读取存储，建议在页面加载时一次性获取字体设置
4. **兼容性**: 确保工具函数路径正确，在不同页面中使用相对路径引入
5. **重要性标记**: 使用 `!important` 确保字体大小设置不会被其他样式覆盖
6. **onShow 监听**: 务必在 `onShow` 中重新应用字体大小，确保从设置页面返回时生效

## 示例代码

完整示例参考以下文件：
- `pages/settings/settings.js` - 设置页面实现
- `pages/index/index.js` - 首页实现
- `pages/font-test/font-test.js` - 字体测试页面实现
- `utils/font-size.js` - 工具函数实现
- `app.wxss` - 全局样式定义

## 技术支持

如遇到问题，请检查：
1. 工具函数引入路径是否正确
2. 数据字段是否正确定义
3. WXML 中类名是否正确绑定
4. 是否在 `onShow` 中重新应用字体大小
5. 存储中是否存在字体大小设置
6. CSS 类名是否有 `!important` 标记

## 故障排查

### 字体大小不生效

1. 检查是否正确引入工具函数
2. 检查是否在 `onLoad` 和 `onShow` 中调用 `applyFontSizeToPage`
3. 检查 WXML 中是否正确绑定了动态类名
4. 检查存储中是否有 `appSettings.fontSize`
5. 检查 CSS 中是否有更高优先级的样式覆盖

### 字体大小变化不一致

1. 确保所有使用动态类名的元素都绑定了 `{{fontSizeClass}}` 或 `{{titleFontSizeClass}}`
2. 检查是否在页面的所有文本元素上应用了字体类
3. 确保没有使用固定 `font-size` 的样式覆盖动态类

