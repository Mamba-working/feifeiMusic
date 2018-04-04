let getJSON = function(url){
  let p = new Promise( (resolve,reject) =>{
    let xhr = new XMLHttpRequest();
    xhr.open("GET",url);
    xhr.onreadystatechange = hanlder;
    xhr.responseType = "json";
    xhr.send()
    
    function hanlder(){
      if(this.readyState !== 4){
        return ;
      }
      if(this.status === 200){
        resolve(this.response);
      }else{
        reject(new Error(this.statusText))
      }
    };
  });
  return p
}

var index = 0
getJSON("http://musicapi.leanapp.cn/top/playlist/highquality?limit=30").then( (ret) =>{
   []
//   return getJSON(`http://musicapi.leanapp.cn/playlist/detail?id=${ret.playlists[0].id}`)
  let playlist =ret.playlists.map( (n) =>{
    return getJSON(`http://musicapi.leanapp.cn/playlist/detail?id=${n.id}`)
  })
  return Promise.all(playlist)
}).then( (ret) =>{
  window.result  = ret;   //window暂时使用方便，加入代码中后会更改
  return getListSong(window.index)
}).then( (ret) =>{
  console.log(ret)
})


function getListSong(index){
  let list = window.result[index].privileges;
  list.map( (n) =>{
    return getJSON(`http://musicapi.leanapp.cn/song/detail?id=${n.id}`)
  })
  return Promise.all(list)
}
