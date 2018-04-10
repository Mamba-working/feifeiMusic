$.fn.boomText = function (type) {
    type = type || 'rollIn'
    this.html(function () {
        var arr = $(this).text()
            .split('').map(function (word) {
                return '<span class="boomText"  style="display:inline-block;opacity: 0;">' + word + '</span>'
            })
        return arr.join('')
    })

    var index = 0
    var $boomTexts = $(this).find('span')
    var clock = setInterval(function () {
        $boomTexts.eq(index).addClass('animated ' + type)
        index++
        if (index >= $boomTexts.length) {
            clearInterval(clock)
        }
    }, 100)
}
var EventCenter = {
    on: function (type, handler) {
        $(document).on(type, handler)
    },
    fire: function (type, data) {
        $(document).trigger(type, data)
    }
}


let footer = {
    init() {
        this.$leftBtn = $(".icon-Left");
        this.$rightBtn = $(".icon-right");
        this.$ul = $(".box").find("ul");
        this.isEnd = false;
        this.isStart = true;
        this.isAnimate = false;
        this.bind();
        this.sendData("//jirenguapi.applinzi.com/fm/getChannels.php")
    },
    bind() {
        this.$rightBtn.on("click", () => {
            if (!this.isEnd) {
                let itemWidth = $(".box ul li").outerWidth(true);
                let rowCount = Math.floor($(".box").outerWidth() / itemWidth);
                if (!this.isAnimate) {
                    this.isAnimate = true;
                    this.$ul.animate({
                        left: "-=" + Math.floor(rowCount * itemWidth),
                    }, 400, () => {
                        this.isStart = false;
                        this.isAnimate = false;
                        if (parseFloat($(".box").width()) - parseFloat(this.$ul.css('left')) >= parseFloat(this.$ul.css('width'))) {
                            this.isEnd = true;
                        }
                    });

                }
            }

        })
        this.$leftBtn.on("click", () => {
            if (!this.isStart) {
                let itemWidth = $(".box ul li").outerWidth(true);
                let rowCount = Math.floor($(".box").outerWidth() / itemWidth);
                if (!this.isAnimate) {
                    this.isAnimate = true;
                    this.$ul.animate({
                        left: "+=" + Math.floor(rowCount * itemWidth),
                    }, 400, () => {
                        this.isEnd = false;
                        this.isAnimate = false;
                        if (parseFloat(this.$ul.css("left")) >= 0) {
                            this.isStart = true;
                        }
                    });

                }
            }


        })
        $(".box ul").on("click", "li", function () {
            EventCenter.fire("select_album", {
                li: $(this),
                channel_id: $(this).attr("data-channel-id"),
                channel_name: $(this).attr("data-channel-name"),
            })
        })
    },
    setStyle() {
        let template = `
        <li  >
        <div class="cover" ></div>
        <h3></h3>
    </li>
        `;
        this.data.forEach(
            (li) => {
                let $node = $(template);
                let img = li.cover_small || "https://ws1.sinaimg.cn/large/b17846e9gy1fptphrxmt5j211c0qot9u.jpg";
                $node.attr("data-channel-id", li.channel_id)
                $node.attr("data-channel-name", li.name)
                $node.find("div.cover").css("background-image", "url" + '(' + img + ')');
                $node.find("h3").text(li.name)
                $(".box ul").append($node)
            }
        )
        let count = this.data.length;
        let width = $(".box ul li").outerWidth(true);
        $(".box ul").css({
            width: count * width
        })
    },
    sendData(url) {
        $.ajax({
            url: url,
            method: 'GET',
            dataType: "jsonp"
        }).done(
            (ret) => {
                this.data = ret.channels;
                this.setStyle()
            }
        ).fail( () =>{
            alert("sendDta fail")
        })
    },
    

}

let Fm = {
    init() {

        this.music = new Audio();
        this.music.autoplay = true;
        this.music.volume = 0.5
        this.fromSearch = false;
        this.bind()
    },
    bind() {

        let _this = this;
        EventCenter.on("searchResult", (e, res) => {
            console.log(res)
            $(".icon-play").removeClass("icon-play").addClass("icon-pause");
            this.fromSearch =true
            this.searchResult = res.data;
            this.mock = res.mock;
            this.index = 0
            this.song = this.searchResult[this.index];
            $.ajax({
               url:"https://musicapimyself.leanapp.cn/song/detail",
               data:{
                   ids:this.searchResult[this.index].id 
               }
            }).done((ret) =>{
               this.picTemp = ret.songs[0].al.picUrl;
               this.loadMusic();
               this.setResult();
            })
           
        })
        EventCenter.on("select_album", (e, channelObj) => {
            this.fromSearch = false;
            this.channel_id = channelObj.channel_id;
            this.channel_name = channelObj.channel_name;
            $(".searchResult").children().remove();
            try {
                this.loadMusic(function (url) {
                    $(".icon-play").removeClass("icon-play").addClass("icon-pause");
                });
                $(".searchResult")
            } catch (e) {
                alert("load fail")
            }

        });
        EventCenter.on("selectLyric",(e,data) =>{
   
            let num = 0;
            let index = data.index;
            let current = 0;
            for(let i in this.lyricObj){
                if( num === index){
                    current = parseInt(i.slice(0,2))*60+parseInt(i.slice(3))
                    this.music.currentTime = current;
                    break
                }else{
                    num += 1;
                }
            }
        });
        $(window).on("click", (e) =>{
            $(".searchResult").slideUp("slow");
        })
        $("section .vbar").on("click", function(e){
              _this.music.volume = e.offsetX / $("section .vbar").width()
              $("section .vbar .currentVbar").css("width",e.offsetX / $("section .vbar").width()*100+"%");

        })
        $("section .lyrics>p").on("click", () =>{

            $(".layout").fadeOut();
            $(".detaillyric").fadeIn();
            $(".detaillyric").css("display","flex")
        })
        $(".searchResult").on("click",".item",function(){
 
           let index = Array.prototype.indexOf.call(document.querySelector(".searchResult").children,this)
           _this.song = _this.searchResult[index];
           _this.index = index;
           if(index !== 0){
               _this.mock = false;
           }else{
               _this.mock = true;
           }
           $.ajax({
            url:"https://musicapimyself.leanapp.cn/song/detail",
            data:{
                ids:_this.searchResult[_this.index].id 
            }
         }).done((ret) =>{
            _this.picTemp = ret.songs[0].al.picUrl;
            _this.loadMusic();
            _this.setResult();
         })
        //    _this.setResult();
        })
        $(".btn-play").on("click", function () {
            if(_this.song){
                $(this).toggleClass("icon-play");
                $(this).toggleClass("icon-pause");
                if (_this.music.paused) {
                    _this.music.play()
                } else {
                    _this.music.pause()
                }
            }
            
        })
        $(".btn-next").on("click", () => {
            $(".icon-play").removeClass("icon-play").addClass("icon-pause");
            if(this.fromSearch){
                if(this.index === this.searchResult.length){
                   this.index = 0; 
                }else{
                    this.index += 1;
                }    
                this.song = this.searchResult[this.index];
            }
                this.loadMusic()
            
            
        })
        $(".btn-collect").on("click", function () {
            $(this).toggleClass("active");
        })
 

        this.music.addEventListener("play", () => {
            $(".icon-play").removeClass("icon-play").addClass("icon-pause");
            $("figure").css("animation-play-state","running");
            clearInterval(this.clock)
            this.clock = setInterval(() => {
                this.updateStatus()
            }, 1000)
        })
        this.music.addEventListener("pause", () => {
            $("figure").css("animation-play-state","paused");
            clearInterval(this.clock)
        })
        this.music.addEventListener("ended", () => {
            this.index ++;
            if(this.fromSearch){
                this.song = this.searchResult[this.index];
            }
           
            this.loadMusic();
        })
        $(".totalBar").on("click", (e) => {
            this.updateProgerss(e.offsetX)
        })
    },
    loadMusic() {

            if(this.fromSearch){
                this.loadLyric();
                this.setMusic();
                return 
            }
            $.ajax({
                url: '//jirenguapi.applinzi.com/fm/getSong.php',
                method: "GET",
                dataType: "jsonp",
                data: {
                    channel: this.channel_id
                }
            }).done((ret) => {
                this.song = ret['song'][0];
                this.setMusic()
                this.loadLyric()
            }).fail(() => {
                clearInterval(clock)
            })
     

    },
    setMusic() {
    try{
        let img = this.song.picture || this.song.album.picUrl || this.picTemp;
        this.music.src = this.song.url || ("http://music.163.com/song/media/outer/url?id="+this.song.id+".mp3");
        $(".background").css("background-image", "url" + '(' + img + ')');
        $("main section h1").fadeOut("slow", () =>{
            $("main section h1").text(this.song.title || this.song.name).fadeIn("slow")
        });
        $(".author").fadeOut("slow",()=>{
            $(".author").text(this.song.artist || this.song.artists[0].name).fadeIn();
        })
        $("main section>.cat").fadeOut("slow",()=>{
            $("main section>.cat").text(this.channel_name || this.song.album.name).fadeIn("slow");
        })
        $("figure").css("background-image", "url" + '(' + img + ')')
    }catch(e){
        console.log("接口出现问题")
    }
     
    },
    loadLyric() {
        let url ='';
        if(this.fromSearch){
            if(this.mock){
                url = "https://easy-mock.com/mock/5acb66ea942d29514de2a31a/getLyric";
                console.log("ok")
            }else{
                url = "https://musicapimyself.leanapp.cn/lyric";
            }
        }else{
            url = "https://jirenguapi.applinzi.com/fm/getLyric.php";
        }
        $.getJSON(url, {
                sid: this.song.sid ,
                id:this.song.id
            })
            .done((ret) => {
                console.log(ret)
                this.fail = false;
                this.lyric = ret.lyric || ret.lrc.lyric  ;
                this.lyricObj = {}
                this.lyric.split("\n").forEach((line) => {
                    let times = line.match(/\d{2}:\d{2}/g);
                    let str = line.replace(/\[\d{2}:\d{2}\.\d{2,4}\]/g, '');
                    if (Array.isArray(times)) {
                        times.forEach((time) => {
                            if(str !== ""){
                                this.lyricObj[time] = str;
                            }
                            
                        })
                    }
               

                })
                $(".detaillyric>ul>li").remove()
                let liTemp = `
                 <li></li>
                `
                for(let li in this.lyricObj){
                      let node = $(liTemp)
                      node.text(this.lyricObj[li]);
                      
                      $(".detaillyric ul").append(node)
                }
            }).fail( (e) =>{
                this.fail = true;
                $(".detaillyric>ul>li").remove()
                $(".lyrics p").text("搜索的歌词功能由于接口问题用不了，歌单的还可以");
                $(".detaillyric ul").append($("<li>接口暂时挂了</li>"))

            })
    },
    updateStatus() {
       
            let width = (this.music.currentTime / this.music.duration) * 100 + "%";
            let minu = ('' + Math.floor(this.music.currentTime / 60)).length === 2 ? Math.floor(this.music.currentTime / 60) + '' : "0" + Math.floor(this.music.currentTime / 60)
            let seconds = ('' + Math.floor(this.music.currentTime % 60)).length === 2 ? Math.floor(this.music.currentTime % 60) + '' : "0" + Math.floor(this.music.currentTime % 60)
            $(".currentBar").css("width", width);
            $(".time").text(minu + ":" + seconds);
            if(!this.fail){
            let lyric = this.lyricObj[minu + ":" + seconds];
            if (lyric) {
                $(".lyrics p").text(lyric).boomText();
                let index =0;
                for(let i in this.lyricObj){
                     if((minu + ":" + seconds) === i){
                        EventCenter.fire("update",{
                            index:index
                        })
                        break;
                     }else{
                         index += 1;
                     }
                }
                
            }
        }
        
            
        
       
       
       
    },
    updateProgerss(x) {
        let width = x / $(".totalBar").width() * 100 + "%";
        this.music.currentTime = x / $(".totalBar").width() * this.music.duration;
        $(".currentBar").css("width", width);

    },
    setResult(){
           let template = `
           <div class="item">
               <p></p>
           </div>
           `
           this.searchResult.forEach((res) =>{
              let node = $(template) 
              node.find("p").text(res.name+" "+res.artists[0].name)
              $(".searchResult").append(node)
           })

    }
}

let search = {
    init() {
        this.mock = false;
        this.bind()
    },
    bind() {
        $(".search>.icon-search").on("click", () => {
            this.keyWords = $(".search>input").val();
            if(this.keyWords ==="遥远的歌"){
                this.mock = true;
            }else{
                this.mock =false;
            }
            $(".search>.searchResult>.item").remove()
            this.getData()
        })
        $(".search>input").on("keyup", (e) => {
            if(e.keyCode === 13){
                $(".search>.icon-search").click();
            }
            
        })
        $(".search").on("click",(e) =>{
              e.stopPropagation();
              
        })
        $(".search>.icon-menu").on("click", function(e){
            $(this).siblings(".searchResult").slideToggle("slow")
        })
       
    },
    getData() {
        console.log("getData")
        $.ajax({
            method: "GET",
            url: "https://musicapimyself.leanapp.cn/search",
            data: {
                keywords: this.keyWords,
            },

        }).done((ret) => {
            EventCenter.fire("searchResult", {
                data: ret.result.songs,
                mock:this.mock
            })
        }).fail( (e) =>{
            alert("接口出现问题")
        })

    },
    
}


let lyricDetail = {
    init(){
       this.index = 0;
       this.bind();
    },
    bind(){
        let _this = this;
        $(".detaillyric>ul").on("click","li",function(){
           EventCenter.fire("selectLyric",{
               index:$(this).index()
           })
        })
        $(".detaillyric>.iconfont").on("click",function(){
            $(".layout").fadeIn();
            $(".detaillyric").fadeOut();
        })
        EventCenter.on("update", (e,data) =>{
            let index = data.index;
            $(".detaillyric>ul>li").css("color","peachpuff")
            $(".detaillyric>ul>li").eq(index).css("color","white");
            if(index > 5){
                $(".detaillyric>ul").animate({
                    scrollTop:`${$(".detaillyric>ul>li").outerHeight(true)*(index-4)}`
                },1000)
            }
            

        })
    }
}
Fm.init()
footer.init()
search.init()
lyricDetail.init()