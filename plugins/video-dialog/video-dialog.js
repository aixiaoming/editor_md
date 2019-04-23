/*!
 * Image (upload) dialog By Qiniu plugin for Editor.md
 *
 * @file        image-dialog-qiniu.js
 * @author      xiaoming@mockingbot.com
 * @version     1.3.4
 * @updateTime  2016-09-02
 * {@link       https://www.hexcode.cn}
 * @license     MIT
 */

;(function() {
    var factory = function(exports) {
      var pluginName = 'video-dialog'
  
      exports.fn.videoDialog = function() {
        var _this = this
        var cm = this.cm
        var lang = this.lang
        var editor = this.editor
        var settings = this.settings
        var cursor = cm.getCursor()
        var selection = cm.getSelection()
        var imageLang = lang.dialog.video
        var classPrefix = this.classPrefix
        var iframeName = classPrefix + 'video-iframe'
        var dialogName = classPrefix + pluginName,
          dialog
  
        cm.focus()

        var loading = function(show) {
          var _loading = dialog.find('.' + classPrefix + 'dialog-mask')
          _loading[show ? 'show' : 'hide']()
        }
  
        if (editor.find('.' + dialogName).length < 1) {
          var guid = new Date().getTime()
    
          var dialogContent = ( (settings.imageUpload) ? 
          "<form id=\"qiniuUploadForm\" method=\"post\" enctype=\"multipart/form-data\" class=\"" + classPrefix + "form\" onsubmit=\"return false;\">" : "<div class=\"" + classPrefix + "form\">" ) +                                      
          "<label>" + imageLang.url + "</label>" +
          "<input type=\"text\" data-url />" +
          "<br/>" +
          "<label>" + imageLang.link + "</label>" +
          "<input type=\"text\" value=\"link\" data-link />" +
          "<br/>" +
      ( (settings.imageUpload) ? "</form>" : "</div>");
  
  
          dialog = this.createDialog({
            title: imageLang.title,
            width: settings.imageUpload ? 465 : 380,
            height: 288,
            name: dialogName,
            content: dialogContent,
            mask: settings.dialogShowMask,
            drag: settings.dialogDraggable,
            lockScreen: settings.dialogLockScreen,
            maskStyle: {
              opacity: settings.dialogMaskOpacity,
              backgroundColor: settings.dialogMaskBgColor
            },
            buttons: {
              enter: [
                lang.buttons.enter,
                function() {
                  var url = this.find('[data-url]').val()
                  var link = this.find('[data-link]').val()
  
                  if (url === '') {
                    alert(imageLang.videoURLEmpty)
                    return false
                  } 

                  if (link === "")
                  {
                    alert(imageLang.videoLinkEmpty)
                    return false
                  }
                  
                  cm.replaceSelection(`<video controls="" preload="none" poster="${link}">\n    <source src="${url}" type="video/mp4">\n</video>`);

                  this.hide().lockScreen(false).hideMask();

                  return false;
                  
              }
            
              ],
  
              cancel: [
                lang.buttons.cancel,
                function() {
                  this.hide()
                    .lockScreen(false)
                    .hideMask()
  
                  return false
                }
              ]
            }
          })
  
          dialog.attr('id', classPrefix + 'image-dialog-' + guid)
  
          if (!settings.imageUpload) {
            return
          }
  
          var fileInput = dialog.find('[name="file"]')
  
          var submitHandler = function() {
            $.ajax({
              url: settings.qiniuTokenUrl,
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
                  dialog.find('[name="token"]').val(ajaxToken)
                  var formData = new FormData($('#qiniuUploadForm')[0])
                  dialog.find('[name="token"]').val() //隐藏令牌
                  $.ajax({
                    url: 'https://upload-z1.qiniup.com',
                    type: 'POST',
                    data: formData,
                    dataType: 'json',
                    beforeSend: function() {
                      loading(true)
                    },
                    cache: false,
                    contentType: false,
                    processData: false,
                    timeout: 30000,
                    success: function(result) {
                      dialog
                        .find('[data-url]')
                        .val(result.domain + '/' + result.key)
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
  
          dialog.find('[type="submit"]').bind('click', submitHandler)
  
          fileInput.bind('change', function() {
            var fileName = fileInput.val()
            var isImage = new RegExp(
              '(\\.(' + settings.imageFormats.join('|') + '))$'
            ) // /(\.(webp|jpg|jpeg|gif|bmp|png))$/
  
            if (fileName === '') {
              alert(imageLang.uploadFileEmpty)
  
              return false
            }
  
            if (!isImage.test(fileName)) {
              alert(imageLang.formatNotAllowed + settings.imageFormats.join(', '))
              return false
            }
  
            dialog.find('[type="submit"]').trigger('click')
          })
        }
  
        dialog = editor.find('.' + dialogName)
        dialog.find('[type="text"]').val('')
        dialog.find('[type="file"]').val('')
        dialog.find('[data-link]').val('https://')
  
        this.dialogShowMask(dialog)
        this.dialogLockScreen()
        dialog.show()
      }
    }
  
    // CommonJS/Node.js
    if (
      typeof require === 'function' &&
      typeof exports === 'object' &&
      typeof module === 'object'
    ) {
      module.exports = factory
    } else if (typeof define === 'function') {
      // AMD/CMD/Sea.js
      if (define.amd) {
        // for Require.js
  
        define(['editormd'], function(editormd) {
          factory(editormd)
        })
      } else {
        // for Sea.js
        define(function(require) {
          var editormd = require('./../../editormd')
          factory(editormd)
        })
      }
    } else {
      factory(window.editormd)
    }
  })()
  