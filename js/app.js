var app = angular.module('myApp',["firebase"]);

app.filter('cut', function () {
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                  //Also remove . and , so its gives a cleaner result.
                  if (value.charAt(lastspace-1) == '.' || value.charAt(lastspace-1) == ',') {
                    lastspace = lastspace - 1;
                  }
                  value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        };
});

app.filter('trustHtml', function ($sce) {
        return function (input) {
            return $sce.trustAsHtml(input);
        }
    });


app.controller("dataController",function($firebaseArray,$scope){

	//制式化:參數填入資料庫url
	var ref = new Firebase("https://rdo-web.firebaseio.com/");
	this.data = $firebaseArray(ref);

	//連結資料庫中之子物件
	this.post = $firebaseArray(ref.child("post"));


	// ----------------------------------------------------------------------
	// 新增公告
	// ----------------------------------------------------------------------

	// 取得時間
	var d = new Date();
	var hour = d.getMonth() + 1;
	var date = d.getDate()*1;
	if ( hour < 10){
		hour = 0 + hour.toString();
	}
	if ( date < 10){
		date = 0 + date.toString();
	}
	var time = d.getFullYear().toString() +  hour + date;
	console.log(time);

	//取得發文時間
	getTime = function(){
		var d = new Date();
		var month = d.getMonth() + 1;
		var date = d.getDate()*1;
		var hours = d.getHours();
		var minutes = d.getMinutes();
		if ( month < 10){
			month = 0 + month.toString();
		}
		if ( date < 10){
			date = 0 + date.toString();
		}
		if ( hours < 10){
			hours = 0 + hours.toString();
		}
		if ( minutes < 10){
			minutes = 0 + minutes.toString();
		}
		return d.getFullYear() + "/" + month + "/" + date + " - " +  hours + ":" + minutes;
	}

	// // 建立公告
	this.newPost={}
	this.newPost.type=[];
	this.newPost.subject="";
	this.newPost.source="";
	this.newPost.sourceURL="";
	this.newPost.content="";
	this.newPost.time="";

	// // 建立當日順序
	var order;
	ref.once("value", function(snap) {
		if ( snap.child('post').child(time).exists() == false ){
			console.log("not exists");
			order = 1;	
	  		ref.child('post').child(time).child('order').set(1);
		}else{
	  		order = snap.child('post').child(time).val().order;
	  		console.log(order);
	  	}
	});

	
	// 新增
	this.addpost = function (content,post) {
		console.log(content);
		console.log("here");
		// if(post.type!="" && post.subject!="" && post.source!="" && post.sourceURL!="" && post.content!=""){

		// 	this.newPost.type = post.type;
		// 	this.newPost.subject = post.subject;
		// 	this.newPost.source = post.source;
		// 	this.newPost.sourceURL = post.sourceURL;
		// 	this.newPost.content = post.content;
		// 	this.newPost.time = getTime();

		// 	console.log("post successful");

		// 	ref.child('post').child("time").child(time).child(order).set(this.newPost);
		// 	ref.child('post').child('all').child(order).set(this.newPost);
		// 	this.newPost = {};
		// 	order = order*1 + 1;
		// 	ref.child('post').child(time).child('order').set(order);

		// 	alert("新增成功");
		// 	window.location = 'http://localhost/web/adminList.php';
		// }
	}
	// ----------------------------------------------------------------------
	// 公告管理-取得公告
	// ----------------------------------------------------------------------

	this.show = $firebaseArray(ref.child("post").child('all'));
	// 日期順序
	this.order;

	this.orderGet = function(){
		if(this.order==true){
			return '-time';
		}
		else{
			return 'time';
		}
	}

	this.test = function(){
		console.log(this.show);
	}

	// 分頁排版
	this.showData= function(){

		var pagesShown = 1;
	    var pageSize = 15;

	    this.paginationLimit = function(data) {
			return pageSize * pagesShown;
	    };
	    this.hasMoreItemsToShow = function() {
	        return pagesShown < (this.show.length / pageSize);
	    };
	    this.showMoreItems = function() {
	        pagesShown = pagesShown + 1;       
	    };	
	}

	// 排版起始
	this.getStart = function(){
		return 0;
	}

	// ----------------------------------------------------------------------
	// 公告管理-工具
	// ----------------------------------------------------------------------

	// 刪除公告
	this.deletePost = function(item){
		var confirmDel = false;
		confirmDel = window.confirm("確定刪除嗎?");
		if(confirmDel){
			this.show.$remove(item);
			this.show2.$remove(item);
			alert("刪除成功");
		}
		else{
			return false;
		}
	}
	// 編輯公告後儲存
	this.saveEdit = function(item){
		if(item.type!="" && item.subject!="" && item.source!="" && item.sourceURL!="" && item.content!=""){
			this.show.$save(item);
			console.log(this.show2);
			this.show2.$save(item);
			alert("編輯成功");
		}
	}
	// ----------------------------------------------------------------------
	// index-取得公告
	// ----------------------------------------------------------------------
	this.show2 = [];



	this.click = function(item){
		console.log("into")
		console.log(this.show)
		this.show2 = localClick(this.show, item);
	}

	localClick = function(data,item){
		console.log(data)
		console.log(data.length)
		output = [];
		if(item=="高教資訊"){
			for (var i = 0; i < data.length; i++) {
				if ( data[i].type == "高教資訊" ){
					output[output.length] = {
						type : data[i].type,
						subject : data[i].subject,
						source : data[i].source,
						sourceURL : data[i].sourceURL,
						content : data[i].content,
						time : data[i].time
					};
				}
			};
		}
		else if(item=="科技政策"){
			// this.show2 = $firebaseArray(ref.child("post").child('classify').child("科技政策"));
			// console.log(this.show2);
			for (var i = 0; i < data.length; i++) {
				if ( data[i].type == "科技政策" ){
					output[output.length] = {
						type : data[i].type,
						subject : data[i].subject,
						source : data[i].source,
						sourceURL : data[i].sourceURL,
						content : data[i].content,
						time : data[i].time
					};
				}
			};
		}
		else if(item=="大學櫥窗"){
			// this.show2 = $firebaseArray(ref.child("post").child('classify').child("大學櫥窗"));
			// console.log(this.show2);
			for (var i = 0; i < data.length; i++) {
				if ( data[i].type == "大學櫥窗" ){
					output[output.length] = {
						type : data[i].type,
						subject : data[i].subject,
						source : data[i].source,
						sourceURL : data[i].sourceURL,
						content : data[i].content,
						time : data[i].time
					};
				}
			};
		}
		else if(item=="焦點評論"){
			// this.show2 = $firebaseArray(ref.child("post").child('classify').child("焦點評論"));
			// console.log(this.show2);
			for (var i = 0; i < data.length; i++) {
				if ( data[i].type == "焦點評論" ){
					output[output.length] = {
						type : data[i].type,
						subject : data[i].subject,
						source : data[i].source,
						sourceURL : data[i].sourceURL,
						content : data[i].content,
						time : data[i].time
					};
				}
			};
		}
		return output;
	}
	
	ref.child("post").child("all").on("value", function(snap) {
		this.show2 = localClick(this.show,"高教資訊");
	});

	// 分頁排版
	this.showData2= function(){

		var pagesShown = 1;
	    var pageSize = 10;

	    this.paginationLimit2 = function(data) {
			return pageSize * pagesShown;
	    };
	    this.hasMoreItemsToShow2 = function() {
	        return pagesShown < (this.show2.length / pageSize);
	    };
	    this.showMoreItems2 = function() {
	        pagesShown = pagesShown + 1;       
	    };	
	}


})
	