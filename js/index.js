$(function() {

  $('a[href*=#]').bind(editormd.mouseOrTouch("click", "touchend"), function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
      location.hostname == this.hostname)
    {
      var hash = this.hash;
      var target = $(hash);
      target = target.length && target || $('[name=' + hash.slice(1) + ']');

      if (target.length) {
        var offsetTop = target.offset().top;
        $('html,body').animate({scrollTop: offsetTop}, 800);

        return false;
      }
    }
  });

  $('a').click(function() {
    $(this).blur();
  });

  var goToTop = $("#go-to-top");

  $(window).scroll(function(){
    var top = $(this).scrollTop();

    if (top > 180) {
      goToTop.fadeIn();
    } else {
      goToTop.fadeOut();
    }
  });

  var loadingElement = $("#index-loading");
  loading = function(value) {
    if (value) {
      loadingElement.show()
    } else {
      loadingElement.hide()
    }
  }

  var indexMarkdownEditor;
  var qiniuTokenUrl = 'http://localhost.localdomain:8000/api/v2/qiniu/uptoken?bucket=static'

  indexMarkdownEditor = editormd("index-editormd", {
    height           : 580,
    markdown         : '',
    tex              : true,
    tocm             : true,
    emoji            : true,
    taskList         : true,
    codeFold         : true,
    searchReplace    : true,
    htmlDecode       : "style,script,iframe",
    flowChart        : true,
    sequenceDiagram  : true,
    imageUpload      : true,
    imageFormats     : [ "jpg", "jpeg", "gif", "png", "bmp", "webp" ],
    imageUploadURL   : "/uploadfile",
    toolbarIcons : function() {
      return  ["undo", "redo", "|",
      "bold", "del", "italic", "quote", "ucwords", "uppercase", "lowercase", "|",
      "h1", "h2", "h3", "h4", "h5", "h6", "|",
      "list-ul", "list-ol", "hr", "|",
      "link", "reference-link", "qiniu", 'video', "code", "preformatted-text", "code-block", "table", "datetime", "emoji", "html-entities", "pagebreak", "|",
      "goto-line", "watch", "preview", "fullscreen", "clear", "search", "|",
      "help", "info"];
    },
    toolbarIconsClass : {
      qiniu : "fa-cloud-upload",
      video: "fa-file-video-o"
    },
    qiniuTokenUrl : qiniuTokenUrl,                        //本地服务器获取七牛token的url
    onfullscreen : function() {
      this.editor.css("border-radius", 0).css("z-index", 120);
    },
    onfullscreenExit : function() {
      this.editor.css({
        zIndex : 10,
        border : "none",
        "border-radius" : "5px"
      });

      this.resize();
    }
  });

  setTimeout(() => {
    indexMarkdownEditor.fullscreen();
  }, 1000);


document.addEventListener("paste", function (e) {
  var cbd = e.clipboardData;
  var ua = window.navigator.userAgent;

  // 如果是 Safari 直接 return
  if ( !(e.clipboardData && e.clipboardData.items) ) {
      return;
  }

  for(var i = 0; i < cbd.items.length; i++) {
      var item = cbd.items[i];
      if(item.kind == "file"){
          var blob = item.getAsFile();
          if (blob.size === 0) {
              return;
          }

          $.ajax({
            url: qiniuTokenUrl,
            type: 'get',
            dataType: 'json',
            timeout: 2000,
            beforeSend: function() {
              loading(true)
            },
            success: function(result) {
              if (result.token) {
                ajaxToken = result.token

                if (ajaxToken === '') {
                  loading(false)
                  alert('没有获取到有效的上传令牌，无法上传！')
                  return
                }

               let formData = new FormData();
               formData.append('file', blob);
               formData.append('token', ajaxToken);

                $.ajax({
                  url: 'https://upload-z1.qiniup.com',
                  type: 'POST',
                  data: formData,
                  dataType: 'json',
                  beforeSend: function() {
                    // loading(true)
                  },
                  cache: false,
                  contentType: false,
                  processData: false,
                  timeout: 30000,
                  success: function(result) {
                    var url = result.domain + '/' + result.key
                    var alt = null
                    var img1 = new Image();
                    img1.src = url;
                    img1.onload = () => {
                      alt = img1.naturalWidth + '*' +  img1.naturalHeight
                      indexMarkdownEditor.replaceSelection("![" + alt + "](" + url + ")");
                    }
                  },
                  error: function() {
                    alert('上传错误')
                  },
                  complete: function() {
                    loading(false)
                  }
                })
              } else alert('获取 七牛token 失败')
            }
          })
      }
  }
}, false);


});