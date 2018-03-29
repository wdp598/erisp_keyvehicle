'use strict';

/**
 * Config for the router
 */
app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', '$httpProvider', 'JS_REQUIRES',
function ($stateProvider, $urlRouterProvider, $locationProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, $httpProvider, jsRequires) {

    app.controller = $controllerProvider.register;
    app.directive = $compileProvider.directive;
    app.filter = $filterProvider.register;
    app.factory = $provide.factory;
    app.service = $provide.service;
    app.constant = $provide.constant;
    app.value = $provide.value;

    // Disable IE ajax request caching
    var getConfig = 
        {   'Cache-Control':'no-cache',
            'Pragma':'no-cache'
        };
    $httpProvider.defaults.headers['get'] = getConfig
    
    // LAZY MODULES

    $ocLazyLoadProvider.config({
        debug: false,
        events: true,
        modules: jsRequires.modules
    });

    // APPLICATION ROUTES
    // -----------------------------------
    // For any unmatched url, redirect to /app/dashboard
//    $urlRouterProvider.otherwise("/app/assetManagement/baseStationManage");
//    $urlRouterProvider.otherwise("/app/assetManagement/readerManage");
//    $urlRouterProvider.otherwise("/app/gisInfo/map");
    $urlRouterProvider.otherwise("/app/vehicleManagement/vehicleManage");

    // Set up the states 'perfect-scrollbar-plugin', 'perfect_scrollbar',
    $stateProvider.state('app', {
        url: "/app",
        templateUrl: "assets/views/app.html",
        resolve: loadSequence('modernizr', 'moment', 'angularMoment', 'uiSwitch',  'toaster', 'ngAside', 'vAccordion', 'sweet-alert', 'chartjs', 'tc.chartjs', 'oitozero.ngSweetAlert','mapCommon'),
//        resolve: loadSequence('modernizr', 'uiSwitch',  'toaster', 'ngAside', 'vAccordion', 'sweet-alert', 'chartjs', 'tc.chartjs', 'oitozero.ngSweetAlert','mapCommon'),
        abstract: true
    })
    
//***********************车辆查询********************************//
    
    .state('app.vehicleManagement', {
        url: '/vehicleManagement',
        template: '<div ui-view class="fade-in-up"></div>',
        title: '车辆查询',
        ncyBreadcrumb: {
            label: '车辆查询'
        }
    })
    
    //车辆查询
    .state('app.vehicleManagement.vehicleManage', {
        url: '/vehicleManage',
        templateUrl: "assets/views/vehicleManagement/vehicleManage/vehicleManage.html",
        title: '车辆查询',
        ncyBreadcrumb: {
            label: '车辆查询'
        },
//        resolve: loadSequence('select2CssCtrl','select2Ctrl','vehicleManageController','vehicleAddOrUpdateController','vehicleManageService','datepicker','datepicker-zh-CN')
        resolve: loadSequence('select2CssCtrl','select2Ctrl','vehicleManageController','vehicleAddOrUpdateController','vehicleManageService','datetimepicker')
    })
    
//***********************预警处置********************************//
    .state('app.warningDisposal', {
    	url: '/warningDisposal',
    	template: '<div ui-view class="fade-in-up"></div>',
    	title: '预警处置',
    	ncyBreadcrumb: {
    		label: '预警处置'
    	}
    })
    
    //车辆查询
    .state('app.warningDisposal.warningDisposal', {
    	url: '/warningDisposal',
    	templateUrl: "assets/views/warningDisposal/warningDisposal.html",
    	title: ' 实时处置 ',
    	ncyBreadcrumb: {
    		label: '实时处置 '
    	},
    	resolve: loadSequence('select2CssCtrl','select2Ctrl','warningDisposalController','warningDisposalService','datetimepicker')
    })
    //预警设置
    .state('app.warningDisposal.warningSet',{
    	url: '/warningSet',
    	templateUrl: "assets/views/warningDisposal/warningSet.html",
    	title: '预警设置',
    	ncyBreadcrumb: {
    		label: '预警设置'
    	},
    	resolve: loadSequence('warningSetController','warningAddOrQueryController','warningUpdateController','warningSetService','datetimepicker')
    })
    
//***********************地图********************************//
//    .state('app.gisInfo', {
//        url: '/gisInfo',s
//        template: '<div ui-view class="fade-in-up"></div>',
//        title: '地图',
//        ncyBreadcrumb: {
//            label: '地图'
//        }
//    })
//    .state('app.gisInfo.map', {
//        url: '/map',
//        templateUrl: "assets/views/map/map.html",
//        title: '地图',
//        ncyBreadcrumb: {
//            label: '地图'
//        },
//      resolve: loadSequence('mapService','demoMapCtrl')
////      resolve: loadSequence('mapService','mapCtrl')
//    })
    
//    .state('app.map', {
//        url: '/map',
//        template: '<div ui-view class="fade-in-up"></div>',
//        title: '地图',
//        ncyBreadcrumb: {
//            label: '地图'
//        }
//    })
    .state('app.map', {
        url: '/map',
        templateUrl: "assets/views/map/map.html",
        title: '实时监控',
        ncyBreadcrumb: {
            label: '实时监控'
        },
      resolve: loadSequence('mapInit','mainCss','mapService','demoMapCtrl','sweet-alert','datetimepicker')
    })
    
    //跳转页面
    .state('app.map.index',{
    	url: '/index',
    	templateUrl: "assets/views/index/index.html",
    	title: '跳转',
    	ncyBreadcrumb: {
    		label: '跳转'
    	},
    	resolve: loadSequence('indexController','indexService','datetimepicker')
    })
    
    .state('app.trail', {
        url: '/trail',
        templateUrl: "assets/views/map/trail/trail.html",
        title: '轨迹回放',
        ncyBreadcrumb: {
            label: '轨迹回放'
        },
      resolve: loadSequence('mapInit','mainCss','mapService','trailCtrl','sweet-alert','datetimepicker')
    })
    
    
    
//***********************demo********************************//    
    .state('app.demo', {
        url: '/demo',
        template: '<div ui-view class="fade-in-up"></div>',
        title: 'Demo',
        ncyBreadcrumb: {
            label: 'Demo'
        }
    }).state('app.demo.modal', {
        url: '/modal',
        templateUrl: "assets/views/demo/modal.html",
        title: '模态框',
        ncyBreadcrumb: {
            label: '模态框'
        },
        resolve: loadSequence('demoModalCtrl','select2CssCtrl','select2Ctrl')
    }).state('app.demo.notification', {
        url: '/Notifications',
        templateUrl: "assets/views/demo/notification.html",
        title: '通知',
        ncyBreadcrumb: {
            label: '通知'
        },
        resolve: loadSequence('mapInit','mainCss','demoNotificationCtrl')
    }).state('app.demo.dateTime', {
        url: '/dateTime',
        templateUrl: "assets/views/demo/dateTime.html",
        title: '时间',
        ncyBreadcrumb: {
            label: '时间'
        },
        resolve: loadSequence('dateTimeCtrl')
    })
    
   .state('error.404', {
        url: '/404',
        templateUrl: "assets/views/utility_404.html",
    }).state('error.500', {
        url: '/500',
        templateUrl: "assets/views/utility_500.html",
    })

    // Generates a resolve object previously configured in constant.JS_REQUIRES (config.constant.js)
    function loadSequence() {
        var _args = arguments;
        return {
            deps: ['$ocLazyLoad', '$q',
			function ($ocLL, $q) {
			    var promise = $q.when(1);
			    for (var i = 0, len = _args.length; i < len; i++) {
			        promise = promiseThen(_args[i]);
			    }
			    return promise;

			    function promiseThen(_arg) {
			        if (typeof _arg == 'function')
			            return promise.then(_arg);
			        else
			            return promise.then(function () {
			                var nowLoad = requiredData(_arg);
			                if (!nowLoad)
			                    return $.error('Route resolve: Bad resource name [' + _arg + ']');
			                return $ocLL.load(nowLoad);
			            });
			    }

			    function requiredData(name) {
			        if (jsRequires.modules)
			            for (var m in jsRequires.modules)
			                if (jsRequires.modules[m].name && jsRequires.modules[m].name === name)
			                    return jsRequires.modules[m];
			        return jsRequires.scripts && jsRequires.scripts[name];
			    }
			}]
        };
    }
}]);