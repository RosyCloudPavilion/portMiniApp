//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    comps: [],
    defaultComp:
      {
      short_name: '敬请期待',
      img: 'https://markdown-pic-blackboxo.oss-cn-shanghai.aliyuncs.com/下载.jpg',
      desc: '更多企业风险预警案例敬请期待',
      risk: '',
    }
  },
  //事件处理函数
  bindViewTap: function (e) {
    if (e.target.dataset.id){
      wx.navigateTo({
        url: '../graph/graph?recordNo=' + e.target.dataset.recordNo + '&id=' + e.target.dataset.id
      })
    }
  },
  onLoad: function () {
    this.getCompany();
  },

  getCompany:function(){
    var _this=this;
    wx.request({
      url: 'https://www.mylittlefox.art/api/EDU/getCompany',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        res.data.comps.push(_this.data.defaultComp);
        _this.setData({
          comps: res.data.comps,
        })
      }
    })
  }

})
