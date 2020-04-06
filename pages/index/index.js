//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    comps: [],
    comps_origin:[],
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

  onSearchProject(e){
    var _this=this;
    var projects = [];
    if(e.detail!=null){
      wx.request({
        url: 'https://www.mylittlefox.art/api/EDU/searchProject?keyword='+e.detail,
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
      wx.setStorage({
        key: "companyDetail",
        data: this.data.comps[e.currentTarget.dataset.index]
      })
      wx.navigateTo({
        url: '../graph/graph?recordNo=' + e.target.dataset.recordno + '&id=' + e.target.dataset.id
      })
    }
  },

  //事件处理函数
  bindProjectTap: function (e) {
      console.log(e)
      wx.setStorage({
        key: "projectDetail",
        data: this.data.projects[e.currentTarget.dataset.index]
      })
      wx.navigateTo({
        url: '../project/project'
      })
  },

  onLoad: function () {
    this.getCompany();
    this.getProject();
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
          comps_origin: res.data.comps,
        })
      }
    })
  },

  getProject: function () {
    var _this = this;
    wx.request({
      url: 'https://www.mylittlefox.art/api/EDU/getProject',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        res.data.projects.forEach(project=>{
          var relate="";
          var relatestr = project.related_comp.replace(/'/g, '"');
          JSON.parse(relatestr).forEach(pro=>{
            relate = relate+"\n"+pro.name;
          })
          project["relatedComp"] = relate;
        })
        _this.setData({
          projects: res.data.projects,
          projects_origin: res.data.projects,
        })
      }
    })
  }



})
