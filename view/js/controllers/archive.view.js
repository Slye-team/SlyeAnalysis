/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2017 Slye Development Team. All Rights Reserved.
 *       Licence: MIT License
 */
 'use strict';

 let $archive = angular.module('sa.archives.view', ['ngRoute']);
 $archive.config(['$routeProvider', function ($routeProvider) {
     $routeProvider.when('/view/:app/archives/:archive', {
         templateUrl: '/templates/archive.view.html',
         controller: 'ArchiveViewCtrl'
     });
 }]);

 $archive.controller("ArchiveViewCtrl", function ($scope, $timeout, $http, $routeParams, $interval, $rootScope) {
     $timeout(function(){
         componentHandler.upgradeAllRegistered();
     })
     $scope.app     = $routeParams.app
     $scope.file    = $routeParams.archive
     $scope.utc     = true
     let _res

     $scope.toggleUTC   = function(){
         $timeout(function(){
             $scope.utc = !$scope.utc
             parseData()
         })
     }

     function parseData(){
         let data       = _res.data
         let time       = data.date
         let total      = []
         data           = data.data
         let r          = {
             'total': [[]],
             'e': {

             }
         }
        let endpoints  = Object.keys(data)
        endpoints.sort()
        if(endpoints.length == 0)
            return
        let len = data[endpoints[0]].views.length
        r.total[0] = Array.apply(null, Array(len)).map(Number.prototype.valueOf,0)
        total = Array.apply(null, Array(endpoints.length + 1)).map(Number.prototype.valueOf,0)
        for(let endpoint in data){
            r.e[endpoint] = [[]]
        }

        let labels = []
        let delta   = new Date()
        delta = delta.getTimezoneOffset() * 60 * 1000 * $scope.utc

        for(let i = 0;i < len;i++){
            let d = new Date((time + (i + 1) * 10 * 60) * 1000 + delta)
            labels.push(d)

            for(let epi = 0;epi < endpoints.length;epi++){
                let endpoint    = endpoints[epi]
                let v           = data[endpoint].views[i]
                r.total[0][i]   += v
                r.e[endpoint][0].push(v)
                total[epi]  += v
                total[total.length - 1] += v
            }
        }

        $timeout(function(){
            $scope.labels   = labels
            $scope.data     = r
            $scope.loading  = false
            $scope.time     = time
            $scope.total    = total
            let i = -1
            $scope.polarData= Array.apply(null, Array(endpoints.length)).map(function(){
                i++
                return total[i]
            })
            $scope.polarType= 'polarArea'
            $scope.togglePolar = function () {
                $scope.polarType = $scope.polarType === 'polarArea' ?
                'pie' : 'polarArea';
            }
            $scope.endpoints= endpoints
        })
     }

     $scope.updateData  = function(){
         $timeout(function(){$scope.loading = true})
         $http.get("/archives/" + $scope.app + '/' + $scope.file).then(function(response) {
             _res = response
             $timeout(parseData, 500)
        });
     }
     $scope.updateData()

    $scope.series = ['']
    $scope.data = [[]]

    $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }]
    $scope.options = {
        fillColor : "#ffff00",
      scales: {
        yAxes: [
          {
            id: 'y-axis-1',
            type: 'linear',
            display: true,
            position: 'right',
            ticks: {
                // stepSize: 1,
                min: 0,
                autoSkip: false,
                callback: function(label, index, labels) {
                    if(Math.floor(label) < label)
                        return ''
                    if(label > 1000)
                        return label/1000+'k'
                    return Math.round(label * 10) / 10
                }
            },
            scaleLabel: {
                display: true,
                labelString: 'Req/10Min'
            }
          }
      ],
      xAxes: [{
                // display: false
                type: 'time',
                time: {
                  unit: 'hour',
                  displayFormats: {
                      hour: "HH:mm",
                      minute: "HH:mm"
                  }
                },
            }]
    },
    maintainAspectRatio: false,
    animation : false,
    showTooltips: false,
    tooltips: {
        callbacks: {
            title: function(tooltipItem, data){
                tooltipItem = tooltipItem[0]
                let d = tooltipItem.xLabel
                let s = new Date(d.valueOf() - 10 * 60 * 1000)

                let f = x => {
                    x = '' + x
                    return (x.length < 2 ? '0' : '') + x
                }
                return (
                    f(s.getHours()) + ':' + f(s.getMinutes()) + '-' +
                    f(d.getHours()) + ':' + f(d.getMinutes())
                )
            },
            label: function(tooltipItem, data) {
                return tooltipItem.yLabel || 0
            }
        }
    }
    };

 });
