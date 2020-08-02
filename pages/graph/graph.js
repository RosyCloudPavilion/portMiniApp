import * as echarts from '../../ec-canvas/echarts';
let chart = null;
let chart2 = null;
let comp_id = null;
let comp_name = null;
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
  //     wx.navigateTo({
  //       url: '../link/link?source='+comp_id+'&target='+params.data.id
  //     })
  // });
  return chart;
}

function initChart2(canvas, width, height, dpr) {
  chart2 = echarts.init(canvas, null, {
    width: '450',
    height: '375',
    devicePixelRatio: dpr // 像素
  });
  canvas.setChart(chart2);
  //当点击节点时进行跳转到其他企业或产品页面
  // chart.on('click', function (params) {
  //     wx.navigateTo({
  //       url: '../link/link?source='+comp_id+'&target='+params.data.id
  //     })
  // });
  return chart2;
}

Page({
  data: {
    ec: {
      onInit: initChart
    },
    ec2: {
      onInit: initChart2
    },
    loading:true,
    loading2: true,
    loads: true,
    show:false,
    companys: [],
    projects: [],
    nodes:[],
    links:[],
    consensuses:[],
    activeNames: ['0'],
    credit:[],
    basic:[],
    activeBasic:['1','2'],
    active: 0,
    comp:{},
    desc:[],
  },


  onResize(res) {
    //ec2.resize({ width: '1200px', height: '375px'});
    // this.setData({
    //   loading2: false,
    // })
    console.log(res.size.windowWidth) // 新的显示区域宽度
    console.log(res.size.windowHeight) // 新的显示区域高度
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

  getCorrelation(e){
    var name = e.currentTarget.dataset.name;
    var id;
    this.data.nodes.forEach(item=>{
      if(item.name==name){
        wx.navigateTo({
          url: '../link/link?source=' + comp_id + '&target=' + item.id
        })
      }
    })
  },

  onShareAppMessage(){
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: comp_name,
      path: '../graph/graph?id=' + comp_id
    }
  },

  onLoad: function (option) {
    var _this = this;
    comp_id  = option.id
    // wx.getStorage({
    //   key: 'companyDetail',
    //   success: function (res) {
    //     //res.data[option.index].basic = JSON.parse(res.data[option.index].basic);
    //     _this.setData({
    //       comp: res.data[option.index]
    //     })
    //   }
    // })
    this.getCompDetail(option.id);
  },

  getCompDetail(id){
    var _this = this;
    wx.request({
      url: 'https://www.mylittlefox.art/api/port/getCompanyById?id=' + id,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        _this.setData({
          comp: res.data.comps[0]
        })
        comp_name = res.data.comps[0].name;
        setTimeout(function () {
          _this.getRiskData(res.data.comps[0].id);
        }, 1000)
        _this.getConsensusData(res.data.comps[0].id)
        if (option.recordNo != 0) {
          _this.getKexinData(res.data.comps[0].recordNo);
        }
      }
    })
  },



  getRiskData(id) {
    var _this = this;
    wx.request({
      url: 'https://www.mylittlefox.art/api/port/getRiskByCompanyId?id=' + id,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        const graph = res.data;
        options.series[0].data = graph.nodesList;
        options.series[0].links = graph.linksList;
        chart.setOption(options);
        chart2.setOption(options);
        if (res.data.pathsList.length==0){
          res.data.pathsList.push({risk:"暂无"})
        }
        _this.setData({
          loads: false,
          riskList: res.data.pathsList,
          product:res.data.productsList
        })
        _this.save();
      }
    })
  },

  //事件处理函数
  bindProductTap: function (e) {
    if (e.target.dataset.id) {
      wx.navigateTo({
        url: '../product/product?graph=' + e.target.dataset.graph + '&id=' + e.target.dataset.id + '&index=' + JSON.stringify(e.currentTarget.dataset.index)
      })
    }
  },

  toVisible(){
    this.setData({
      loading: !this.data.loading,
    })
   // chart2.resize({  height: '375' });
  },

  share(){
    wx.setClipboardData({
      data: comp_name + "风险分析报告，点击链接查看【来自智慧口岸包打听】: " + 'https://www.mylittlefox.art/api/port/getPDF?id=' + comp_id ,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data) // data
          }
        })
      }
    })
  },

  save() {
    const ecComponent = this.selectComponent('#mychart-dom-bar');
    // 先保存图片到临时的本地文件，然后存入系统相册
    ecComponent.canvasToTempFilePath({
      success: res => {
        console.log("tempFilePath:", res.tempFilePath)

        wx.uploadFile({
          url: 'https://www.mylittlefox.art/api/port/upload',
            filePath: res.tempFilePath,
            name: 'file',
            formData: {
              'id': comp_id
            },
            success(res) {
              const data = res.data
              //do something
            }
        })
        //存入系统相册
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath || '',
          success: res => {
            console.log("success", res)
          },
          fail: res => {
            console.log("fail", res)
          }
        })
      },
      fail: res => console.log(res)
    });
  },

  getConsensusData(id){
    var _this = this;
    wx.request({
      url: 'https://www.mylittlefox.art/api/port/getConsensus?id='+id,
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

  bindConsensusTap(e) {
    wx.setStorage({
      key: "consensusDetail",
      data: this.data.consensuses[e.currentTarget.dataset.index]
    })
    wx.navigateTo({
      url: '../consensus/consensus'
    })
  },

  getKexinData(recordNo){
    var _this=this;
    wx.request({
      url: 'https://www.mylittlefox.art/v1/enterpriseCredit/' + recordNo,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        _this.setData({
          show:true,
          credit: res.data[0]
        })
      }
    })

    wx.request({
      url: 'https://www.mylittlefox.art/v1/enterprises/' + recordNo,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        _this.setData({
          basic: res.data[0]
        })
      }
    })
  },

  getProjectDetail(e){
    wx.request({
      url: 'https://www.mylittlefox.art/api/port/searchProject?keyword=' + e.currentTarget.dataset.title,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if(res.data.projects){
          console.log(res.data.projects)
          wx.setStorage({
            key: "projectDetail",
            data: res.data.projects[0]
          })
          wx.navigateTo({
            url: '../project/project'
          })
        }
      }
    })
  },

  toTourong(){
    wx.navigateTo({
      url: '../tourong/tourong?id=' + comp_id
    })
  },

  toHolder(){
    wx.navigateTo({
      url: '../holder/holder?id=' + comp_id
    })
  }
});