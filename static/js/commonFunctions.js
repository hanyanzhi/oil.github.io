$.extend({
    openLoading: function(){
        var loadingPage = '<div class="page-loading-wrap">'+
                          '<img src="static/img/page_loading.gif" alt="" />'+
                          '</div>';
        $('body>div').append(loadingPage);
    },
    closeLoading: function(){
        $('.page-loading-wrap').remove();
    }
});
// 调用
//$.openLoading();  //打开
//$.closeLoading(); //关闭
