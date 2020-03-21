import * as echarts from '../../ec-canvas/echarts';
let chart = null;
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
    activeNames: ['0']
  },

  onChange(event) {
    this.setData({
      activeNames: event.detail
    });
  },

  onLoad: function () {
    var _this = this;
    wx.request({
      url: 'https://www.mylittlefox.art/api/EDU/getRiskByCompany/',
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
      url: 'https://www.mylittlefox.art/api/EDU/getAllNodesAndLinks/',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        const graph = res.data;

        var categories = [{ name: "企业" }, { name: "人" }, { name: "风险" }, { name: "招投标项目" }, { name: "产品" }];

        var option = {
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
              data: graph.nodes,
              links: graph.links,
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
        chart.setOption(option);
      }
    });
  }
});