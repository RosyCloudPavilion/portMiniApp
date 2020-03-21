//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    fits: [{
      fit: '优优汇联',
      src: 'https://markdown-pic-blackboxo.oss-cn-shanghai.aliyuncs.com/yyhl.jpg'
    }, {
      fit: '上海晨鸟',
      src: 'https://markdown-pic-blackboxo.oss-cn-shanghai.aliyuncs.com/chenniao.png'
    },
    {
      fit: '敬请期待',
      src: 'https://markdown-pic-blackboxo.oss-cn-shanghai.aliyuncs.com/下载.jpg'
    }],
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../graph/graph'
    })
  },
  onLoad: function () {

  },

})
