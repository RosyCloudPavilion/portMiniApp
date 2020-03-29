import * as echarts from '../../ec-canvas/echarts';
let chart = null;
var categories = [{ name: "企业" }, { name: "人" }, { name: "风险" }, { name: "招投标项目" }, { name: "产品" }];
let options = {
  title: {
    text: '风险知识图谱',
    subtext: 'Default layout',
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
      focusNodeAdjacency: true,
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
      lineStyle: {
        color: 'source',
        curveness: 0.3
      },
      emphasis: {
        lineStyle: {
          width: 10
        }
      },
      force: {
        repulsion: 80,
        gravity: 0.01,
        edgeLength: [50, 200]
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
  return chart;
}

Page({
  data: {
    ec: {
      onInit: initChart
    },
    companys: [],
    projects: [],
    activeNames: ['0'],
    credit:[],
    basic:[],
    activeBasic:['1','2'],
    active: 0
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

  onLoad: function (option) {
    var _this = this;
    if (option.recordNo =="E350203201708151521"){
      wx.request({
        url: 'https://www.mylittlefox.art/api/EDU/getRiskByCompany?recordNo=' + option.recordNo,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          _this.setData({
            companys: res.data.riskComp,
            projects: res.data.riskProject
          })
        }
      })
      wx.request({
        url: 'https://www.mylittlefox.art/api/EDU/getAllNodesAndLinks?recordNo=' + option.recordNo,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          const graph = res.data;
          options.series[0].data= graph.nodes;
          options.series[0].links = graph.links;
          chart.setOption(options);
        }
      });
    }
    if (option.recordNo){
    wx.request({
      url: 'https://www.mylittlefox.art/v1/enterpriseCredit/' + option.recordNo,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        _this.setData({
          credit: res.data[0]
        })
      }
    })
    wx.request({
      url: 'https://www.mylittlefox.art/v1/enterprises/' + option.recordNo,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        _this.setData({
          basic: res.data[0]
        })
      }
    })
    }
  }
});