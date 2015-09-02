var omdbSearch = (function(){
  var ready = true;
  var search = function(title) {
    //Search for title
    $.ajax({
      // API URL
      url: "http://www.omdbapi.com/?s=" + title + "&r=json",
      type: "GET",
      dataType : "json",
      //Perform search on each result
      success: function(json) {
        if (json.Response === "False"){
      //If nothing is found
          notFound();
      // Results found
        } else {
        //Iterate through results array
          for (var i = 0; i < json.Search.length; i++) {
          //Perform an individual imdbID search for each result in the search array
            $.ajax({
              url: "http://www.omdbapi.com/?i=" + json.Search[i].imdbID + "&r=json",
              type: "GET",
              dataType: "json",
              success: function(result) {
              //Just in case...
                if (json.Response === "False"){
                  notFound();
              //Place information in search results
                } else {
                  update(result);
                }
              }
            });
          }
        }
      },
      //Failure
        error: function( xhr, status, errorThrown ) {
          notFound();
        },
    });
  }

  var browse = function() {
    //Add loading placeholder out here since it's looping 10X
    $('#container').append('<p id="loading">Loading...</p>')
    //Load ten movies at a time
    for (var i = 0; i < 10; i++) {
      //Random IMDB ID
      var id = 'tt00'+(Math.floor(Math.random()*99999));
      //Perform an individual imdbID search for each result in the search array
      $.ajax({
        url: "http://www.omdbapi.com/?i=" + id + "&r=json",
        type: "GET",
        dataType: "json",
        success: function(result) {
          if (result.Response === "True"){
            //Remove loading placeholder when first result is available
            $('#loading').remove();
            //Display results
            update(result);
          }
        },
        error: function( ) {
          notFound();
        },
      });
      //Remove loading placeholder on final iteration
      if (i === 9) {
        setTimeout(function(){ready = true}, 500);
      }
    }
  }

  var update = function(json) {
    //Display IMDB logo if no poster image
    var image = json.Poster === "N/A" ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/IMDb_logo.svg/200px-IMDb_logo.svg.png' : json.Poster;
    //Display result
    $('#container').append(
      '<div class="movie_result">' +
        '<img class="movie_poster" src="' + image + '">' +
        '<div class="movie_text">' +
          '<h3>' + json.Title + ' (' + json.Year + ')</h3>' +
          '<p>' + json.Rated + ' | ' + json.Runtime + ' | '+ json.Genre + ' | ' + json.Released + ' (' + json.Country + ') | Language: ' + json.Language + '<p>' +
          '<p><a href="http://www.imdb.com/title/' + json.imdbID + '">IMDB</a> Rating: ' + json.imdbRating + ' | Votes: ' + json.imdbVotes + '<p>' +
          '<p>' + json.Plot + '</p>' +
          '<h4>Director:</h4><p>' + json.Director + '</p>' +
          '<h4>Writer:</h4><p>' + json.Writer + '</p>' +
          '<h4>Stars:</h4><p>' + json.Actors + '</p>' +
          '<h4>Awards:</h4><p>' + json.Awards + '</p>' +
        '</div>' +
        '<div class="clearfloat"></div>' +
      '</div>'
    );
  }
  //Not found
  var notFound = function() {
    $('#container').append(
      '<div class="movie_fail">' +
        '<h4>Result not found.</h4>' +
      '</div>'
    )
  }

  //Scroll refresh
    function bindScroll() {
      //Check to see if ready for reload && at bottom of page
      if(ready === true && $(window).scrollTop() + $(window).height() > $(document).height() - 10 ) {
        //Prevent too many triggers
        ready = false;
        //Remov scroll binding so browse can happen
        $(window).unbind('scroll');
        //Next ten
        browse();
        //Resent infinite scroll
        $(window).bind('scroll', bindScroll);
      }
    }

  //Revealing module design pattern
  return {
    search: search,
    browse: browse,
    bindScroll: bindScroll
  };

})();

$('document').ready(function(){
  
  //Search submit
  $('#search').click(function(){
    //Prevent reload
    event.preventDefault();
    //Execute search function
    omdbSearch.search( $('#searchbar').val() );
  });

  //Browse submit
  $('#browse').click(function(){
    //Prevent reload
    event.preventDefault();
    //Remove search tool
    $('#container').empty();
    //Load 10 random movies
    omdbSearch.browse();
    //Set up infinite scroll
    $(window).scroll(omdbSearch.bindScroll);
  });

});