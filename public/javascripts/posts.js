/* Works but not seeing the console.logs - even with the change */

/* 
The jqXHR.success(), jqXHR.error(), and jqXHR.complete() callbacks are removed as of jQuery 3.0. You can use jqXHR.done(), jqXHR.fail(), and jqXHR.always() instead.
*/

$(document).ready(function() {
    $('.vote-up').submit(function(e) {
      e.preventDefault();
  
      const postId = $(this).data('id');

      $.ajax({
        type: 'PUT',
        url: 'posts/' + postId + '/vote-up'
      }).done(function(data) {
        console.log('voted up!');
      }).fail(function(err) {
        console.log(err.messsage);
      })
    
    });
  
    $('.vote-down').submit(function(e) {
      e.preventDefault();
  
      const postId = $(this).data('id');
      $.ajax({
        type: 'PUT',
        url: 'posts/' + postId + '/vote-down',
        success: function(data) {
          console.log('voted down!');
        },
        error: function(err) {
          console.log(err.messsage);
        }
      });
    });
  });