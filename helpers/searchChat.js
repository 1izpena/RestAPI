'use strict';


module.exports = function(request, response, client) {

	return client.search({
      index: 'messages',
      body: {
        query: {
                    query_string: {
                    	query: "(content.title:"+request.body.key+
                    		" OR content.text:"+request.body.key+
                    		//" OR content.answers._user:"+request.body.key+
                    		" OR content.answers.text:"+request.body.key+
                    		" OR content.filename:"+request.body.key+
                    		//" OR _user:"+request.body.key+
                    		") AND (_channel:"+request.params.channelid+")"
                    }

                    	
                }

      		}
           

    });


  
};
