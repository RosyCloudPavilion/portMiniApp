import * as echarts from '../../ec-canvas/echarts';
let chart = null;
let comp_id = null;
var categories = [{ name: "物流商" }, { name: "产品" }, { name: "牧场" }, { name: "收货企业" }, { name: "生产商" }, { name: "报关企业" }, { name: "乳制品" }, { name: "员工" }];
let options = {
  title: {
    text: '风险知识图谱',
    top: 'bottom',
    left: 'right'
  },
  roam: true,
  tooltip: {},
  legend: [{
    // selectedMode: 'single',
    data: categories.map(function (a) {
      return a.name;
    })
  }],
  animationDuration: 1500,
  animationEasingUpdate: 'quinticInOut',
  series: [
    {
      name: 'risk graph',
      type: 'graph',
      layout: 'force',
      data: [],
      links: [],
      categories: categories,
      roam: true,
      itemStyle: {
        normal: {
          borderColor: '#fff',
          borderWidth: 1,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      },
      label: {
        position: '',
        formatter: '{b}'
      },
      // lineStyle: {
      //   color: 'source',
      //   curveness: 0.3
      // },
      emphasis: {
        lineStyle: {
          width: 10
        }
      },
      force: {
        repulsion: 80,
        gravity: 0.01,
        edgeLength: [50, 200]
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          return params.name;
        }
      }
    }
  ]
};
function initChart(canvas, width, height, dpr) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // 像素
  });
  canvas.setChart(chart);
  //当点击节点时进行跳转到其他企业或产品页面
  // chart.on('click', function (params) {
  //   wx.navigateTo({
  //     url: '../link/link?source=' + comp_id + '&target=' + params.data.id
  //   })
  // });
  return chart;
}

Page({
  data: {
    ec: {
      onInit: initChart
    },
    loading: true,
    loads: true,
    show: false,
    companys: [],
    projects: [],
    nodes: [],
    links: [],
    consensuses: [],
    activeNames: ['0'],
    credit: [],
    basic: [],
    activeBasic: ['1', '2'],
    active: 0,
    comp: {},
    desc: [],
  },


  onChange(event) {
    this.setData({
      activeNames: event.detail
    });
  },

  onChangeBasic(event) {
    this.setData({
      activeBasic: event.detail
    });
  },

  onTab(event) {

  },

  getCorrelation(e) {
    var name = e.currentTarget.dataset.name;
    var id;
    this.data.nodes.forEach(item => {
      if (item.name == name) {
        wx.navigateTo({
          url: '../link/link?source=' + comp_id + '&target=' + item.id
        })
      }
    })
  },


  onShareAppMessage() {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: this.data.comp.name,
      path: '../product/product?id=' + comp_id
    }
  },

  onLoad: function (option) {
    var _this = this;
    comp_id = option.id
    // console.log(option.index)
    // wx.getStorage({
    //   key: 'productDetail',
    //   success: function (res) {
    //     _this.setData({
    //       comp: JSON.parse(option.index)
    //     })
    //   }
    // })
    this.getProductDetail(comp_id);

    setTimeout(function () {
      _this.getBatch();
      _this.getRiskData(option.id);
    }, 1000)
    
    
  },

  getProductDetail(id){
    var _this = this;
    wx.request({
      url: 'https://www.mylittlefox.art/api/port/getProductById?id='+id,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        _this.setData({
          comp: res.data.product,
        })
      }
    })
  },

  getBatch: function () {
    var _this = this;
    wx.request({
      url: 'https://www.mylittlefox.art/api/port/getBatch',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        var batch = []
        res.data.batch.forEach(item => {
          if (item.product_name == _this.data.comp.name) {
            batch.push(item)
          }
        })
        _this.setData({
          batch: batch,
        })
      }
    })
  },

  //事件处理函数
  bindEventTap: function (e) {
    // wx.setStorage({
    //   key: "eventDetail",
    //   data: this.data.events[e.currentTarget.dataset.index]
    // })
    wx.navigateTo({
      url: '../event/event?batch=' + JSON.stringify(e.currentTarget.dataset.index)
    })
  },

  toVisible() {
    this.setData({
      loading: !this.data.loading,
    })
  },

  getConsensusData(id) {
    var _this = this;
    wx.request({
      url: 'https://www.mylittlefox.art/api/port/getConsensus?id=' + id,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        _this.setData({
          consensuses: res.data.consensus,
        })
      }
    })
  },

  getRiskData(id) {
    var _this = this;
    wx.request({
      url: 'https://www.mylittlefox.art/api/port/getRiskByProductId?id=' + id,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        const graph = res.data;
        options.series[0].data = graph.nodesList;
        options.series[0].links = graph.linksList;
        chart.setOption(options);
        if (res.data.pathsList.length == 0){
          res.data.pathsList.push({
            path:"暂无",
            risk:"/"
          })
        }
        _this.setData({
          loads: false,
          riskList: res.data.pathsList,
        })
      }
    })
  },
});