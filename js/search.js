var maxHits = 0;
var userNum = 0;
var url = "";
var curr_page = 0;
var total_pages = 0;

function fill_result( data, startPoint, recordsNum ){

	var maxRecord = min(recordsNum, data.length);
		//console.log("maxRecord="+maxRecord);

	for(var i=0; i < maxRecord; i++){

  		var html_h3 =  "<h3><span class='badge badge-dark badge-pill'>"
  		html_h3 += "" + (startPoint+i) +"</span>";
  		if(data[i].headline.print_headline)
  			html_h3 += data[i].headline.print_headline;
  		else html_h3 += data[i].headline.main;
  		html_h3 += "</h3>";
  		var list_item = $("<li>").html(html_h3);
  		list_item.addClass("list-group-item article");
  		// section
  		// date data[i].pub_date
  		var pubDate = data[i].pub_date;
  		if(pubDate) pubDate = (data[i].pub_date).substr(0,10);
  		var date_html = "<span>"+ pubDate +"</span><br>";
  		list_item.append(date_html);

  		// link data[i].web_url
  		var html_link = "<a href='"+data[i].web_url+"'>"+data[i].web_url+"</a>";
  		list_item.append(html_link);
  		
  		$("#result").append(list_item);
  	}

}

function min(a, b){
	if(a<=b) return a;
	else return b;
}

function requestArticlesPageN(){
	$.ajax({
		url: url+"&page="+curr_page,
		method: 'GET',
	})
	.done(function(result) {
		var recN = 10;
		if (curr_page == total_pages-1){
			recN = userNum - (total_pages-1)*10;
		} 
  		fill_result(result.response.docs, curr_page*10+1, recN);
  		curr_page++;

	})
	.fail(function(err) {
		throw err;
	});
}

$("#btn-clear").on("click", function(){
	event.preventDefault();
	$("#result").empty();
});

$("#btn-search").on("click", function(){
	event.preventDefault();
	$("#result").empty();

	var query = $("#article-title").val();
	var start = $("#start_date").val();
	var end = $("#end_date").val();

	userNum = $("#article-records").val();

	var max_page = 0;
	var maxHits = 0;
	var max_num = 0;

	url = "";

	if(query){
		query = query.trim();
		url += "http://api.nytimes.com/svc/search/v2/articlesearch.json?q=" +query+" &api-key=3bf2cf798ca747aebaa31784f90aa7f4";	

		if(start){
			url += "&begin_date"+start;
			if(end){
				url += "&end_date"+end;
			}
			else{
				url += "&end_date=01/01/2017";// to do: current year
			}
		}
		
		$.ajax({
			url: url+"&page=0",
			method: 'GET',
		})
		.done(function(result) {

			console.log(result);

		  	maxHits = result.response.meta.hits;

		  	var firstPageRecN = min(userNum, maxHits);
		  	firstPageRecN = min(firstPageRecN, 10);

		  	fill_result(result.response.docs, 1, firstPageRecN);

		  	//========= make a cycle through next pages
		  	var pagesHits = Math.ceil(maxHits/10);
		  	var pagesUser = Math.ceil(userNum/10);
		  	
		  	total_pages = min(pagesHits, pagesUser);
		  	curr_page = 1;

		  	for(var j=1; j<total_pages; j++){
				setTimeout( requestArticlesPageN,(1000*j) );
		  	}
		})
		.fail(function(err) {
			throw err;
		});

	}
});
