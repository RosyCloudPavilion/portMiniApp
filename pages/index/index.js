//index.js
//获取应用实例
import * as echarts from '../../ec-canvas/echarts';
let chart = null;
const app = getApp()
var categories = [{ name: "物流商" }, { name: "产品" }, { name: "牧场" }, { name: "收货企业" }, { name: "生产商" }, { name: "报关企业" }];
var options = {
  title: {
    text: '风险知识图谱',
    subtext: 'Default layout',
    top: 'bottom',
    left: 'right'
  },
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
        repulsion: 150,
        gravity: 0.01,
        edgeLength: [20, 90]
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
    comps: [],
    comps_origin:[],
    events: [],
    events_origin: [],
    projects:[],
    projects_origin:[],
    defaultComp:
      {
      short_name: '敬请期待',
      img: 'https://markdown-pic-blackboxo.oss-cn-shanghai.aliyuncs.com/下载.jpg',
      desc: '更多企业风险预警案例敬请期待',
      risk: '',
      searchComp:'',
      searchProject:''
    },
    active: 0,
  },

  onSearchComp(e) {
    var comps=[];
    if (e.detail != null) {
      this.data.comps_origin.forEach(item=>{
        if(item.name){
          if (item.name.indexOf(e.detail)!=-1){
            comps.push(item);
          }
        }
      })
      this.setData({
        comps:comps
      })}
    else{
      this.setData({
        comps: this.data.comps_origin
      })
    }
  },

  onSearchEvent(e) {
    var events = [];
    if (e.detail != null) {
      this.data.events_origin.forEach(item => {
        if (item.title) {
          if (item.title.indexOf(e.detail) != -1) {
            events.push(item);
          }
        }
      })
      this.setData({
        events: events
      })
    }
    else {
      this.setData({
        events: this.data.events_origin
      })
    }
  },

  

  onSearchProject(e){
    var _this=this;
    var projects = [];
    if(e.detail!=null){
      wx.request({
        url: 'https://www.mylittlefox.art/api/port/searchProject?keyword='+e.detail,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          res.data.projects.forEach(project => {
            var relate = "";
            var relatestr = project.related_comp.replace(/'/g, '"');
            JSON.parse(relatestr).forEach(pro => {
              relate = relate + "\n" + pro.name;
            })
            project["relatedComp"] = relate;
          })
          _this.setData({
            projects: res.data.projects,
            projects_origin: res.data.projects,
          })
        }
      })
    }else{
      this.setData({
        projects: this.data.projects_origin
      })
    }
  },
  onChange(event) {

  },

  //事件处理函数
  bindViewTap: function (e) {
    if (e.target.dataset.id){
      wx.navigateTo({
        url: '../graph/graph?recordNo=' + e.target.dataset.recordno + '&id=' + e.target.dataset.id + '&index=' + e.currentTarget.dataset.index + '&graph=' + e.target.dataset.graph
      })
    }
  },

  //事件处理函数
  bindProductTap: function (e) {
    if (e.target.dataset.id) {
      wx.navigateTo({
        url: '../product/product?graph=' + e.target.dataset.graph + '&id=' + e.target.dataset.id + '&index=' + JSON.stringify(e.currentTarget.dataset.index)
      })
    }
  },

  //事件处理函数
  bindProjectTap: function (e) {
      wx.setStorage({
        key: "projectDetail",
        data: this.data.projects[e.currentTarget.dataset.index]
      })
      wx.navigateTo({
        url: '../project/project?id='+e.currentTarget.dataset.id
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

  onLoad: function () {
    this.getCompany();
    this.getProject();
    this.getEvent();
    //this.getGraph();
  },

  getGraph:function(){
    setTimeout(function () {
      wx.request({
        url: 'http://114.55.107.122:8080/RiskVisualization/getAllNodesAndLinks',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          const graph = res.data;
          graph.nodes.forEach((item,index)=>{
            graph.nodes[index].symbolSize = item.symbolSize/3
          })
          options.series[0].data = graph.nodes;
          options.series[0].links = graph.links;
          chart.setOption(options);
        }
      });
    }, 1000)
  },
  getCompany:function(){
    var _this=this;
    wx.request({
      url: 'https://www.mylittlefox.art/api/port/getGraphCompany',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        // res.data.comps.push(_this.data.defaultComp);
        _this.setData({
          comps: res.data.comps,
          comps_origin: res.data.comps,
        })
        wx.setStorage({
          key: "companyDetail",
          data: res.data.comps
        })
      }
    })
  },

  getEvent: function () {
    var _this = this;
    wx.request({
      url: 'https://www.mylittlefox.art/api/port/getBatch',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        _this.setData({
          batch: res.data.batch,
          batch_origin: res.data.batch,
        })
      }
    })
  },

  getProject: function () {
    var _this = this;
    wx.request({
      url: 'https://www.mylittlefox.art/api/port/getProduct',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        _this.setData({
          product: res.data.product,
          product_origin: res.data.product,
        })
        wx.setStorage({
          key: "productDetail",
          data: res.data.product
        })
      }
    })
  }



})
