/*
 * View model for OctoPrint-Print-Queue
 *
 * Author: Michael New
 * License: AGPLv3
 */

$(function() {
	function ContinuousPrintViewModel(parameters) {
		var self = this;
		self.params = parameters;
		self.printerState = parameters[0];
		self.loginState = parameters[1];
		self.files = parameters[2];
		self.settings = parameters[3];
		self.is_paused = ko.observable();
        self.is_looped = ko.observable();
        self.ncount=1;
        self.itemsInQueue=0;
        
		self.onBeforeBinding = function() {
			self.loadQueue();
			self.is_paused(false);
            self.checkLooped();
		}
        
       
        
        
       
		
		
		self.loadQueue = function() {
            $('#queue_list').html("");
			$.ajax({
				url: "plugin/continuousprint/queue",
				type: "GET",
				dataType: "json",
				headers: {
					"X-Api-Key":UI_API_KEY,
				},
				success:function(r){
                    self.itemsInQueue=r.queue.length;
					if (r.queue.length > 0) {
						$('#queue_list').html("");
						for(var i = 0; i < r.queue.length; i++) {
							var file = r.queue[i];
							var row;
                            var Enter = false;

                            var other = "<i style='cursor: pointer' class='fa fa-chevron-down' data-index='"+i+"'></i>&nbsp; <i style='cursor: pointer' class='fa fa-chevron-up' data-index='"+i+"'></i>&nbsp;";
                            if (i == 0) {other = "";}
                            if (i == 1) {other = "<i style='cursor: pointer' class='fa fa-chevron-down' data-index='"+i+"'></i>&nbsp;";}
                            row = $("<div class='"+i+"'style='padding: 10px;border-bottom: 1px solid #000;"+(i==0 ? "background: #f9f4c0;" : "")+"'><div class='queue-row-container'><div class='queue-inner-row-container'><input class='fa fa-text count-box' type = 'text' data-index='"+i+"' value='" + file.count + "'/><p class='file-name' > " + file.name + "</p></div><div>" + other + "<i style='cursor: pointer' class='fa fa-minus text-error' data-index='"+i+"'></i></div></div></div>");
                            row.find(".fa-minus").click(function() {
                                self.removeFromQueue($(this).data("index"));
                            });
                            row.find(".fa-chevron-up").click(function() {
                                self.moveUp($(this).data("index"));
                            });
                            row.find(".fa-chevron-down").click(function() {
                                self.moveDown($(this).data("index"));
                            });
                            row.find(".fa-text").keydown(function() {
                                if (event.keyCode === 13){
                                    Enter = true;
                                }else{
                                    Enter = false;
                                }

                            });
                            row.find(".fa-text").keyup(function() {
                                if (Enter){
                                    var ncount= parseInt(this.value);
                                    self.changecount($(this).data("index"),ncount);
                                }
                            });
                             $('#queue_list').append(row);
                        }
                       
                        self.loadPrintHistory("full");
                    }else{
                        self.loadPrintHistory("empty");
                    }
                }
							 
								
				
			});
                
		};    
                        
            self.loadPrintHistory = function(items){
                $('#print_history').html("");
                $.ajax({
				url: "plugin/continuousprint/print_history",
				type: "GET",
				dataType: "json",
				headers: {
					"X-Api-Key":UI_API_KEY,
				},
				success:function(r){
					if (r.queue.length > 0) {
						$('#print_history').html("");
						for(var i = 0; i < r.queue.length; i++) {
                            var file=r.queue[i];
                            var row;
                            var time = file.time / 60;
                            var suffix = " mins";
                            if (time > 60) {
                                time = time / 60;
                                suffix = " hours";
                                if (time > 24) {
                                    time = time / 24;
                                    suffix = " days";
                                }
                            }

                            row = $("<div style='padding: 15px; border-bottom: 1px solid #000;background:#c2fccf'><div class='queue-row-container'><div class=file-done-container' ><p>Complete:</p> <div class='file-done-name>" + file.name + "</div></div> <div class='time-data'>average time: " + time.toFixed(0) + suffix + " Times run:" + file.times_run + "</div><div class='previous-prints'>" + file.title + "</div></div></div>")
                       
                            $('#print_history').append(row);
                        }
                    
                                } else if(items=="empty"){
                                    $('#queue_list').html("<div style='text-align: center'>Queue is empty</div>");
                                }
                       }
                   });
            }
            self.reloadQueue = function(data,CMD) {
                if(CMD=="ADD"){
                    var file = data;
                    var row;
                    var Enter = false;
                    var other = "<i style='cursor: pointer' class='fa fa-chevron-down' data-index='"+self.itemsInQueue+"'></i>&nbsp; <i style='cursor: pointer' class='fa fa-chevron-up' data-index='"+self.itemsInQueue+"'></i>&nbsp;";
                    if (self.itemsInQueue == 0) {other = "";$('#queue_list').html("");}
                    if (self.itemsInQueue == 1) {other = "<i style='cursor: pointer' class='fa fa-chevron-down' data-index='"+self.itemsInQueue+"'></i>&nbsp;";}
                    row = $("<div class='" + self.itemsInQueue + "' style='padding: 10px;border-bottom: 1px solid #000;"+(self.itemsInQueue==0 ? "background: #f9f4c0;" : "")+"'><div class='queue-row-container'><div class='queue-inner-row-container'><input class='fa fa-text count-box' type = 'text' data-index='"+self.itemsInQueue+"' value='" + file.count + "'/><p class='file-name' > " + file.name + "</p></div><div>" + other + "<i style='cursor: pointer' class='fa fa-minus text-error' data-index='"+self.itemsInQueue+"'></i></div></div></div>");
                    row.find(".fa-minus").click(function() {
                        self.removeFromQueue($(this).data("index"));
                    });
                    row.find(".fa-chevron-up").click(function() {
                        self.moveUp($(this).data("index"));
                    });
                    row.find(".fa-chevron-down").click(function() {
                        self.moveDown($(this).data("index"));
                    });
                    row.find(".fa-text").keydown(function() {
                        if (event.keyCode === 13){
                            Enter = true;
                        }else{
                            Enter = false;
                        }
                    });
                    row.find(".fa-text").keyup(function() {
                        if (Enter){
                            var ncount = parseInt(this.value);
                            self.changecount($(this).data("index"),ncount);
                        }
                    });
                    $('#img').fadeOut("slow", function(){
                       var div = $(row).hide();
                       $(this).replaceWith(div);
                       $('#foo').fadeIn("slow");
                    });
                
                $('#queue_list').append(row);
                    self.itemsInQueue+=1;
                
            }
            if(CMD=="SUB"){
                $("#queue_list").children("."+data).remove();
                for(var i=data+1;i<self.itemsInQUeue;i++){
                    $("#queue_list").children("."+i).children(".queue-row-container").children(".queue-innner-row-container").children(".count-box").data("index",(i-1).toString());
                    $("#queue_list").children("."+i).children(".queue-row-container").children(".fa-minus").data("index",(i-1).toString());
                    if(i>1){
                        $("#queue_list").children("."+i).children(".queue-row-container").children(".fa-chevron-down").data("index",(i-1).toString());
                        if(i>2){
                            $("#queue_list").children("."+i).children(".queue-row-container").children(".fa-chevron-up").data("index",(i-1).toString());
                        }
                    }
                    $("#queue_list").children("."+i).addClass((i-1).toString());
                    $("#queue_list").children("."+i).removeClass(i.toString());
                }
                self.itemsInQueue-=1;
            }
             
        }

                
                        

                      
	    self.checkLooped = function(){
            $.ajax({
				url: "plugin/continuousprint/looped",
				type: "GET",
				dataType: "text",
				headers: {"X-Api-Key":UI_API_KEY},
				success: function(c) {
					if(c=="true"){
                        self.is_looped(true);
                    } else{
                        self.is_looped(false);
                    }
				},
			});
        }
		self.getFileList = function() {
			$('#file_list').html("");
			$.ajax({
				url: "/api/files?recursive=true",
				type: "GET",
				dataType: "json",
				headers: {
					"X-Api-Key":UI_API_KEY,
				},
				success:function(r){
					var filelist = [];
					if (r.files.length > 0) {
						filelist = self.recursiveGetFiles(r.files);
					
						for(var i = 0; i < filelist.length; i++) {
							var file = filelist[i];
							var row = $("<div data-name='"+file.name.toLowerCase()+"' style='padding: 10px;border-bottom: 1px solid #000;'>"+file.path+"<div class='pull-right'><i style='cursor: pointer' class='fa fa-plus text-success' data-name='"+file.name+"' data-path='"+file.path+"' data-sd='"+(file.origin=="local" ? false : true)+"'></i></div></div>");
							row.find(".fa").click(function() {
								self.addToQueue({
									name: $(this).data("name"),
									path: $(this).data("path"),
									sd: $(this).data("sd"),
                                    count: 1
								});
							});
							$('#file_list').append(row);
						}
						
					} else {
						$('#file_list').html("<div style='text-align: center'>No files found</div>");
					}
				}
			});
		}

		$(document).ready(function(){
			self.getFileList();
			self.checkLooped();
			$("#gcode_search").keyup(function() {
				var criteria = this.value.toLowerCase();
				$("#file_list > div").each(function(){
					if ($(this).data("name").indexOf(criteria) == -1) {
						$(this).hide();
					} else {
						$(this).show();
					}
				})
			});
			
			
		});
		
		
		self.recursiveGetFiles = function(files) {
			var filelist = [];
			for(var i = 0; i < files.length; i++) {
				var file = files[i];
				if (file.name.toLowerCase().indexOf(".gco") > -1 || file.name.toLowerCase().indexOf(".gcode") > -1) {
					filelist.push(file);
				} else if (file.children != undefined) {
					console.log("Getting children", self.recursiveGetFiles(file.children))
					filelist = filelist.concat(self.recursiveGetFiles(file.children));
				}
			}
			return filelist;
		}

		self.addToQueue = function(data) {
            self.reloadQueue(data,"ADD");
			$.ajax({
				url: "plugin/continuousprint/addqueue",
				type: "POST",
				dataType: "text",
				headers: {
					"X-Api-Key":UI_API_KEY,
				},
				data: data,
				success: function(c) {
					
				},
				error: function() {
					self.loadQueue();
				}
			});
		}
		
		self.moveUp = function(data) {
			$.ajax({
				url: "plugin/continuousprint/queueup?index=" + data,
				type: "GET",
				dataType: "json",
				headers: {"X-Api-Key":UI_API_KEY},
				success: function(c) {
					self.loadQueue();
				},
				error: function() {
					self.loadQueue();
				}
			});
		}
        self.changecount = function(data,ncount){
            $.ajax({
				url: "plugin/continuousprint/change?count=" + ncount+"&index="+data,
				type: "GET",
				dataType: "json",
				headers: {"X-Api-Key":UI_API_KEY},
				success: function(c) {
					self.loadQueue();
				},
				error: function() {
					self.loadQueue();
				}
			});
        }
		
		self.moveDown = function(data) {
			$.ajax({
				url: "plugin/continuousprint/queuedown?index=" + data,
				type: "GET",
				dataType: "json",
				headers: {"X-Api-Key":UI_API_KEY},
				success: function(c) {
					self.loadQueue();
				},
				error: function() {
					self.loadQueue();
				}
			});
		}
		
		self.removeFromQueue = function(data) {
            self.reloadQueue(data,"SUB");
			$.ajax({
				url: "plugin/continuousprint/removequeue?index=" + data,
				type: "DELETE",
				dataType: "text",
				headers: {
					"X-Api-Key":UI_API_KEY,
				},
				success: function(c) {
					//self.loadQueue();
				},
				error: function() {
					self.loadQueue();
				}
			});
		}

		self.startQueue = function() {
			self.is_paused(false);
			$.ajax({
				url: "plugin/continuousprint/startqueue",
				type: "GET",
				dataType: "json",
				headers: {
					"X-Api-Key":UI_API_KEY,
				},
				data: {}
			});
		}
        
        self.loop = function() {
            self.is_looped(true);
			$.ajax({
				url: "plugin/continuousprint/loop",
				type: "GET",
				dataType: "json",
				headers: {
					"X-Api-Key":UI_API_KEY,
				},
				data: {}
			});
		}
        self.unloop = function() {
            self.is_looped(false);
			$.ajax({
				url: "plugin/continuousprint/unloop",
				type: "GET",
				dataType: "json",
				headers: {
					"X-Api-Key":UI_API_KEY,
				},
				data: {}
			});
		}
		
		self.resumeQueue = function() {
			self.is_paused(false)
			$.ajax({
				url: "plugin/continuousprint/resumequeue",
				type: "GET",
				dataType: "json",
				headers: {
					"X-Api-Key":UI_API_KEY,
				},
				data: {}
			});
		}

		self.onDataUpdaterPluginMessage = function(plugin, data) {
			if (plugin != "continuousprint") return;

			var theme = 'info';
			switch(data["type"]) {
				case "popup":
					theme = "info";
					break;
				case "error":
					theme = 'danger';
					self.loadQueue();
					break;
				case "complete":
					theme = 'success';
					self.loadQueue();
					break;
				case "reload":
					theme = 'success'
					self.loadQueue();
					break;
				case "paused":
					self.is_paused(true);
					break;
				case "updatefiles":
					self.getFileList();
					break;
			}
			
			if (data.msg != "") {
				new PNotify({
					title: 'Continuous Print',
					text: data.msg,
					type: theme,
					hide: true,
					buttons: {
						closer: true,
						sticker: false
					}
				});
			}
		}
	}

	// This is how our plugin registers itself with the application, by adding some configuration
	// information to the global variable OCTOPRINT_VIEWMODELS
	OCTOPRINT_VIEWMODELS.push([
		// This is the constructor to call for instantiating the plugin
		ContinuousPrintViewModel,

		// This is a list of dependencies to inject into the plugin, the order which you request
		// here is the order in which the dependencies will be injected into your view model upon
		// instantiation via the parameters argument
		["printerStateViewModel", "loginStateViewModel", "filesViewModel", "settingsViewModel"],

		// Finally, this is the list of selectors for all elements we want this view model to be bound to.
		["#tab_plugin_continuousprint"]
	]);
});
