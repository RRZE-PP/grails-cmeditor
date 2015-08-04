//= require jquery
//= require jquery-ui

//= require jquery/jquery.ui.menubar
//= require select2-4.0.0/dist/js/select2.min.js

this.CMEditorMenu = (function(){
	"use strict";

	function CMEditorMenu(cmeditor, rootElem, options, instanceName){
		var self = this;
		self.state = {};

		self.state.instanceNo = CMEditorMenu.instanciated++;
		self.state.instanceName = instanceName !== undefined ? instanceName : "";

		self.cmeditor = cmeditor;
		self.rootElem = rootElem = $(rootElem);
		self.options  = options  = options !== undefined ? options : {};

		initMenus(self);
		addUserDefinedItems(self);
		registerMenuCallbacks(self);
		decorateMenuItems(self);
		initDialogs(self);


		self.rootElem.find(".menu").menubar({
			position: {
				within: $("#demo-frame").add(window).first()
			}
		});

		self.cmeditor.focus();

		registerInstance(self.state.instanceName, self.state.instanceNo, self);
	}

	/*************************************************************************
	 *                    Begin 'static' methods                             *
	 *************************************************************************/
	var clazz = CMEditorMenu;

	clazz.instanciated = 0;
	clazz.instancesNumber = {};
	clazz.instancesString = {};
	clazz.instances = [];

	/*
	 * Logs to the console. If possible prefixed by class name, instance number. The default logLevel is INFO.
	 * Possible values are: ERROR, WARNING, INFO, DEBUG. If Data is supplied, its entries will be printed
	 * one per line
	 *
	 * Possible Parameter combinations:
	 * Message (String), [Loglevel (String, "INFO"), [Data (List of Objects)]]
	 * Instance (Object), Message (String), [Loglevel (String, "INFO"), [Data (Object|List of Objects)]]]
	 */
	var LOGLEVELS = {ERROR: 0, WARNING: 5, INFO: 10, DEBUG: 15}
	var log = clazz.log = function(arg0, arg1, arg2, arg3){
		var className = ((typeof clazz.name != "undefined") ? clazz.name : "IE,really?");
		var instance = "";
		var message = "";
		var logLevel = LOGLEVELS.INFO;
		var data = [];

		if(arg0 instanceof clazz){
			instance = " #" + arg0.state.instanceNo + " '" + arg0.state.instanceName +"'";
			message = arg1;
			logLevel = (typeof arg2 != "undefined") ? LOGLEVELS[arg2] : LOGLEVELS.INFO;
			data = ((typeof arg3 != "undefined")? ((arg3 instanceof Array)? arg3 : [arg3]) : []);
		}else{
			message = arg0;
			logLevel = (typeof arg1 != "undefined") ? LOGLEVELS[arg1] : LOGLEVELS.INFO;
			data = ((typeof arg2 != "undefined")? ((arg2 instanceof Array)? arg2 : [arg2]) : []);
		}

		if(logLevel == LOGLEVELS.DEBUG)    var logF = function(data){console.log(data);}
		if(logLevel == LOGLEVELS.INFO)     var logF = function(data){console.info(data);}
		if(logLevel == LOGLEVELS.WARNING)  var logF = function(data){console.warn(data);}
		if(logLevel == LOGLEVELS.ERROR)    var logF = function(data){console.error(data);}

		logF(className + instance + ": " + message);
		if(data.length != 0){
			console.groupCollapsed != undefined && data.length > 1 && console.groupCollapsed();
			for(var i=0; i<data.length; i++){
				logF(data[i]);
			}
			console.groupEnd != undefined && data.length > 1 &&  console.groupEnd();
		}
	}

	/*
	 * Registers an instance so that it can be accessed with `getInstance`
	 */
	var registerInstance = clazz.registerInstance = function(instanceName, instanceNo, instance){
		clazz.instancesString[instanceName] = instance;
		clazz.instancesNumber[instanceNo]   = instance;
		clazz.instances.push(instance);
		log("registered new CMEditorMenu instance #" + instanceNo + " '" + instanceName + "'", "INFO");
	}

	/*
	 * Returns an instance of this class
	 *
	 * Parameters: identifier (String|Number): the instance name or number
	 */
	 var getInstance = clazz.getInstance = function(identifier){
	 	if(typeof identifier == "number")
	 		return clazz.instancesNumber[identifier];
	 	else
	 		return clazz.instancesString[identifier];
	}

	/*
	 * Returns all instances of this class
	 */
	 var getInstances = clazz.getInstances = function(){
	 	return clazz.instances;
	}

	/*************************************************************************
	 *                    Begin 'private' methods                            *
	 *************************************************************************/

	/*
	 * Initialises menu objects where the keys are the menu items' anchor's names and the values are callbacks
	 */
	function initMenus(self){
		self.menus = {};

		self.menus.fileMenu = {
			new: function(cm) {
				var nameElem = self.dialogs.newFileDialog.find("input[name=name]");
				var folderElem = self.dialogs.newFileDialog.find("input[name=folder]");

				nameElem.val("");
				folderElem.val("/");

				var buttons = {
					Create : function(){
						var name = nameElem.val().trim();
						var folder = folderElem.val().trim();

						if(name === ""){
							alert("Please supply a name");
							return;
						}
						if(folder === ""){
							folder = null;
							self.cmeditor.displayMessage("Your file will be hidden in the folder view. Use the searchbar to find it.");
						}

						var unambigousName = self.cmeditor.getUnambiguousName(name, folder);
						if(name !== unambigousName){
							self.cmeditor.displayMessage("A number was appended to the filename, because it is already in use");
						}

						self.cmeditor.newDoc(unambigousName, folder);
						self.dialogs.newFileDialog.dialog("close");
					},
					Cancel: function(){
						self.dialogs.newFileDialog.dialog("close");
					}
				}

				self.dialogs.newFileDialog.dialog("option", "buttons", buttons);
				self.dialogs.newFileDialog.dialog("open");
			},
			open: function(cm) {

				self.dialogs.openDialog.children().remove();
				var s = $("<select class=\"fileSelect\" name=\"cmeditor-menu-open-select\" multiple=\"multiple\" style=\"width:100%\"/><div class=\"fileSelectTree\" />");

				if(self.options.ajax.listURL){
					$.get(self.options.ajax.listURL, function(data){
						if (data.status == "success") {
							var available = false
							var myButtons = {
								Cancel: function() { $(this).dialog( "close" ); },
							};
							for(var i=0; i < data.result.length; ++i) {
								s.append($("<option />", {value: data.result[i][self.options.mapping["idField"]], text: data.result[i][self.options.mapping["name"]]}));
								available = true;
							}
							if (available == true) {
								s.appendTo(self.dialogs.openDialog);
								self.dialogs.openDialog.find(".fileSelect").select2({placeholder: "Select a file",
  																			 allowClear: true});

								self.dialogs.openDialog.find(".fileSelectTree").fileTree({script:function(fileTreeData){
									//this is called each time the user opens a directory (including root)
									var val = $('<ul class="jqueryFileTree" style="display: none;"></ul>');

									var curPathElems = fileTreeData.dir.split("/");
									var folders = {};

									for(var i=0; i < data.result.length; ++i) {
										if(typeof data.result[i][self.options.mapping["folder"]] !== "undefined" &&
											data.result[i][self.options.mapping["folder"]] !== null) {

											var absPath = data.result[i][self.options.mapping["folder"]];
											absPath = absPath.endsWith("/") ? absPath : absPath+"/";

											if (absPath === fileTreeData.dir) {
												var fileName = data.result[i][self.options.mapping["name"]];
												var fileId = data.result[i][self.options.mapping["idField"]];
												val.append($('<li class="file ext_'+fileName+'"><a href="#" rel='+fileId+'>'+fileName+'</a></li>'));
											}else{
												//save each folder once for later adding
												var pathElems = absPath.split("/");

												if (absPath.startsWith(fileTreeData.dir) && pathElems.length - 1 == curPathElems.length){
													folders[absPath] = pathElems[pathElems.length-2];
												}
											}
										}
									}

									for(absPath in folders){
										val.append($('<li class="directory collapsed"><a href="#" rel="'+absPath+'"">'+folders[absPath]+'</a></li>'));
									}

									return val;
								}}, function(fileId){
									//this is called each time a user selects a file
									var option = self.dialogs.openDialog.find(".fileSelect option[value="+fileId+"]");
									option.attr("selected", !option.attr("selected")).trigger("change");
								});

								//workaround a width calculation bug in select2
								self.dialogs.openDialog.find(".select2-search__field").css("width", "auto");

								myButtons.Open = function() {
									var vals = self.dialogs.openDialog.find(".fileSelect").val();
									for (var i in vals) {
										self.cmeditor.ajax_load(vals[i]);
									}
									$(this).dialog( "close" );
								};
							} else {
								s = $("<p class=\"noFiles\" name=\"cmeditor-menu-open-no-files\">No files available.</p>");
								s.appendTo(self.dialogs.openDialog);
							}

							self.dialogs.openDialog.dialog("option", "buttons", myButtons);
							self.dialogs.openDialog.dialog("open");
						} else {
							self.cmeditor.displayMessage(data.msg);
						}
					}).fail(function(XMLHttpRequest,textStatus,errorThrown){self.cmeditor.displayMessage("An error occured: "+ textStatus +" " + errorThrown);});
				}
			},
			save: function(cm) { self.cmeditor.saveDoc(); },
			saveas: function(cm) { self.cmeditor.saveDocAs(); },
			rename: function(cm) {
				var newNameElem = self.dialogs.renameDialog.find("input[name=newName]");
				var newFolderElem = self.dialogs.renameDialog.find("input[name=newFolder]");

				var oldName = self.cmeditor.curDoc.getName();
				var oldFolder = self.cmeditor.curDoc.getFolder();

				newNameElem.val(oldName);
				newFolderElem.val(oldFolder);

				var buttons = {
					Rename : function(){
						var newName = newNameElem.val().trim();
						var newFolder = newFolderElem.val().trim();

						if(newName === ""){
							alert("Please supply a name");
							return;
						}
						if(newFolder === ""){
							newFolder = null;
							self.cmeditor.displayMessage("Your file will be hidden in the folder view. Use the searchbar to find it.");
						}

						if(newName !== oldName || newFolder !== oldFolder){
							var unambigousName = self.cmeditor.getUnambiguousName(newName, newFolder);

							self.cmeditor.moveDoc(newFolder);
							self.cmeditor.renameDoc(unambigousName);

							if(newName !== unambigousName){
								self.cmeditor.displayMessage("A number was appended to the filename, because it is already in use");
							}
						}

						self.dialogs.renameDialog.dialog("close");
					},
					Cancel: function(){
						self.dialogs.renameDialog.dialog("close");
					}
				}

				self.dialogs.renameDialog.dialog("option", "buttons", buttons);
				self.dialogs.renameDialog.dialog("open");
			},
			delete: function(cm) { self.cmeditor.deleteDoc(); },
			close: function(cm) { self.cmeditor.closeDoc(); },
			quit: function(cm) {
				if (typeof cm.toTextArea == "function") {
					cm.toTextArea();
					self.rootElem.find(".container").remove();
				} else {
					self.cmeditor.rootElem.remove();
				}
			},
		};

		self.menus.viewMenu = {
			readOnly: function(cm) {
				if (!cm.getOption("readOnly")) {
					cm.setOption("readOnly", "nocursor");
					self.rootElem.find(".viewMenu a[value='addonfullscreen']").parent().addClass("ui-state-disabled");
				} else {
					cm.setOption("readOnly", false);
					self.rootElem.find(".viewMenu a[value='addonfullscreen']").parent().removeClass("ui-state-disabled");
				}
			},
			diff: function(cm) { if(typeof self.cmeditor.diff == "function") self.cmeditor.diff(); },
			goto: function(cm) {

				var first = self.cmeditor.codeMirror.doc.firstLine()+1;
				var last = self.cmeditor.codeMirror.doc.lastLine()+1;
				var current = self.cmeditor.codeMirror.getCursor().line+1;

				var input = self.dialogs.gotoDialog.find("input");
				input.attr("min", first);
				input.attr("max", last);
				input.val(current);
				window.setTimeout(function(){input.focus()}, 0); //focus does not work directly for some reason

				self.dialogs.gotoDialog.find(".gotoLabel").text("Enter line number ("+first+".."+last+"):");

				var buttons = {Cancel: 	function() { self.dialogs.gotoDialog.dialog("close"); },
							  Ok: 		function() {
											var line = parseInt(input.val());

											if(isNaN(line) || line < first || line > last){
												alert("Please enter a valid line number!");
												return;
											}

											self.dialogs.gotoDialog.dialog("close");
											self.cmeditor.codeMirror.setCursor(line-1, 0);
										}
							  }
				input.keyup(function(e){ if(e.which == 13) buttons.Ok() }); //call ok on enter

				self.dialogs.gotoDialog.dialog("option", "buttons", buttons);
				self.dialogs.gotoDialog.dialog("open");
			 },
			addonfullscreen: function(cm) {
				if (!cm.getOption("readOnly")) {
					self.cmeditor.toggleFullscreen();
		        }
		    }
		}

		//add available modes dynamically
		var modesMenuElem = self.rootElem.find(".modesMenu");
		if(self.options.availableModes === undefined){
			self.options.availableModes = [];
		}

		for(var i=0; i < self.options.availableModes.length; i++){
			var mode = self.options.availableModes[i];
			self.menus.viewMenu["mode"+mode] = (function(mode){return function(){self.cmeditor.setMode(mode)}})(mode);
			modesMenuElem.append('<li><a href="#" value="mode'+mode+'"><span></span>'+mode+'</a></li>');
		}


		self.menus.optionsMenu = {
			diffBeforeSave: function(cm) {
				if(typeof self.cmeditor.setDoDiffBeforeSaving == "function")
					self.cmeditor.setDoDiffBeforeSaving(self.rootElem.find(".optionsMenu a[value='diffBeforeSave']").children("span").hasClass("ui-icon-check")); },
			bindingdefault: function(cm) { cm.setOption("keymap", "default"); cm.setOption("vimMode", false); },
			bindingvim: function(cm) { cm.setOption("keymap", "vim"); cm.setOption("vimMode", true); },
			bindingemacs: function(cm) { cm.setOption("keymap", "emacs"); cm.setOption("vimMode", false); },
			bindingsublime: function(cm) { cm.setOption("keymap", "sublime"); cm.setOption("vimMode", false); },
		};

		//add available themes dynamically
		var themesMenuElem = self.rootElem.find(".themesMenu");
		if(self.options.availableThemes === undefined){
			self.options.availableThemes = ["default"];
		}
		function getThemeCallback(self, theme){
			return function(cm){CMEditor.loadTheme(theme, function(){self.cmeditor.codeMirror.setOption("theme", theme); self.cmeditor.copyCMTheme();})};
		}
		for(var i=0; i < self.options.availableThemes.length; i++){
			var theme = self.options.availableThemes[i];
			self.menus.optionsMenu["theme"+theme] = getThemeCallback(self, theme);
			themesMenuElem.append('<li><a href="#" value="theme'+theme+'"><span></span>'+theme+'</a></li>');
		}


		self.menus.addonsMenu = {
			addondonation: function(cm) {
				self.dialogs.donationDialog.dialog("open");
			},
		};
	}

	/*
	 * Initialises the modal dialogs
	 */
	function initDialogs(self){
		self.dialogs = {};

		self.dialogs.donationDialog = self.rootElem.find(".donationDialog").dialog({
					autoOpen: false,
					height: 300,
					buttons: {
						Yes: function() { $( this ).dialog( "close" ); },
						No: function() { $( this ).dialog( "close" ); },
					},
				});

		self.dialogs.openDialog = self.rootElem.find(".openMenu").dialog({
					autoOpen: false,
					height: 500,
					width: 300
				});

		self.dialogs.renameDialog = self.rootElem.find(".renameDialog").dialog({
					autoOpen: false,
					height: 300,
					width: 500
				});

		self.dialogs.newFileDialog = self.rootElem.find(".newFileDialog").dialog({
					autoOpen: false,
					height: 300,
					width: 500
				});

		self.dialogs.gotoDialog = self.rootElem.find(".gotoDialog").dialog({
				autoOpen: false
		});

	}

	/*
	 * Adds items to the menu which the user defined via options
	 */
	function addUserDefinedItems(self) {
		if (typeof self.options.overlayDefinitionsVar !== "undefined") {
			for(var name in self.options.overlayDefinitionsVar) {
				var s = $("<li><a href=\"#\" value=\"mode"+name+"\"><span></span>"+name+"</a></li>");
				s.appendTo(self.rootElem.find(".modesMenu"));
				self.menus.viewMenu["mode"+name] = function(name) {
					return function(cm) { cm.setOption("mode", name); };
				}(name);
			}
		}
	}

	/*
	 * Marks or grays out some menu items depending on their values
	 */
	function decorateMenuItems(self){
		self.rootElem.find(".modesMenu a[value='mode"+self.options.mode+"']").children("span").addClass("ui-icon ui-icon-check");

		if(self.options.useSession){
			if (localStorage["cmeditor-menu-binding"])
				self.rootElem.find(".optionsMenu a[value='binding"+localStorage["cmeditor-menu-binding"]+"']").children("span").addClass("ui-icon ui-icon-check");
			else
				self.rootElem.find(".optionsMenu a[value='bindingdefault']").children("span").addClass("ui-icon ui-icon-check");

			if (localStorage['cmeditor-menu-theme'])
				self.rootElem.find(".optionsMenu a[value='theme"+localStorage['cmeditor-menu-theme']+"']").children("span").addClass("ui-icon ui-icon-check");
			else
				self.rootElem.find(".optionsMenu a[value='themedefault']").children("span").addClass("ui-icon ui-icon-check");

			if (localStorage['cmeditor-menu-diffBeforeSave'] === true)
				self.rootElem.find(".optionsMenu a[value='diffBeforeSave']").children("span").addClass("ui-icon ui-icon-check");
			else if (self.options.defaultDiffBeforeSave)
				self.rootElem.find(".optionsMenu a[value='diffBeforeSave']").children("span").addClass("ui-icon ui-icon-check");

		}else{
			self.rootElem.find(".optionsMenu a[value='binding"+self.options.binding+"']").children("span").addClass("ui-icon ui-icon-check");
			self.rootElem.find(".optionsMenu a[value='theme"+self.options.theme+"']").children("span").addClass("ui-icon ui-icon-check");

			if(self.options.defaultDiffBeforeSave){
				self.rootElem.find(".optionsMenu a[value='diffBeforeSave']").children("span").addClass("ui-icon ui-icon-check");
			}
		}

		if(self.options.defaultReadOnly){
			self.rootElem.find(".viewMenu a[value='readOnly']").children("span").addClass("ui-icon ui-icon-check");
		}
		if(self.options.readOnly){
			self.rootElem.find(".viewMenu a[value='readOnly']").children("span").addClass("ui-icon ui-icon-check");
			self.rootElem.find(".viewMenu a[value='readOnly']").parent().addClass("ui-state-disabled");
			self.rootElem.find(".fileMenu a[value='new']").parent().addClass("ui-state-disabled");
			self.rootElem.find(".fileMenu a[value='save']").parent().addClass("ui-state-disabled");
			self.rootElem.find(".fileMenu a[value='saveas']").parent().addClass("ui-state-disabled");
			self.rootElem.find(".fileMenu a[value='rename']").parent().addClass("ui-state-disabled");
			self.rootElem.find(".fileMenu a[value='delete']").parent().addClass("ui-state-disabled");
		}

		if(typeof self.cmeditor.diff != "function") {
			self.rootElem.find(".viewMenu a[value='diff']").parent().remove();
			self.rootElem.find(".optionsMenu a[value='diffBeforeSave']").parent().remove();
		}
	}

	/*
	 *	Registers click callbacks on anchors in menu items
	 */
	function registerMenuCallbacks(self){

		self.rootElem.find(".fileMenu a").click(function(event) {
			var value = $(this).attr("value");

			if(typeof value === "undefined"){
		    	event.preventDefault();
				return;
			}

			var found = self.menus.fileMenu[value];
		    self.cmeditor.focus();

		    if (found) found(self.cmeditor.getCodeMirror());

			event.preventDefault();
		});

		self.rootElem.find(".viewMenu a").click(function(event) {
			var value = $(this).attr("value");

			if(typeof value === "undefined"){
		    	event.preventDefault();
				return;
			}

			var found = self.menus.viewMenu[value];
		    self.cmeditor.focus();

		    if (found) found(self.cmeditor.getCodeMirror());

		    if (value.indexOf("mode") == 0) {
				$(this).parent().parent().find("span").removeClass("ui-icon ui-icon-check");
				$(this).children("span").addClass("ui-icon ui-icon-check");
		    }
		    if (value.indexOf("readOnly") == 0) {
		    	if (self.cmeditor.getCodeMirror().getOption("readOnly")) {
		    		$(this).children("span").addClass("ui-icon ui-icon-check");
		    	} else {
		    		$(this).children("span").removeClass("ui-icon ui-icon-check");
		    	}
		    	self.cmeditor.update();
		    }
			event.preventDefault();
		});

		self.rootElem.find(".optionsMenu a").click(function(event) {
			var value = $(this).attr("value");

			if(typeof value === "undefined"){
		    	event.preventDefault();
				return;
			}

			if (value.indexOf("diffBeforeSave") == 0) {
				if ($(this).children("span").hasClass("ui-icon-check")) {
					$(this).children("span").removeClass("ui-icon ui-icon-check");
				} else {
					$(this).children("span").addClass("ui-icon ui-icon-check");
				}
			} else {
				$(this).parent().parent().find("span").removeClass("ui-icon ui-icon-check");
				$(this).children("span").addClass("ui-icon ui-icon-check");
			}

			var found = self.menus.optionsMenu[value];
		    self.cmeditor.focus();

		    if (found) found(self.cmeditor.getCodeMirror())

			if(self.options.useSession){
			    if (value.indexOf("binding") == 0) {localStorage["cmeditor-menu-binding"] = value.substring(7);}
			    if (value.indexOf("theme") == 0) {localStorage["cmeditor-menu-theme"] = value.substring(5);}
			    if (value.indexOf("diffBeforeSave") == 0) {localStorage["cmeditor-menu-diffBeforeSave"] = $(this).children("span").hasClass("ui-icon-check");}
			}
		    //return false;
		    event.preventDefault();
		});

		self.rootElem.find(".addonsMenu a").click(function(event) {
			var value = $(this).attr("value");

			if(typeof value === "undefined"){
		    	event.preventDefault();
				return;
			}

			var found = self.menus.addonsMenu[value];
		    self.cmeditor.focus();
		    if (found) found(self.cmeditor.getCodeMirror());

		    event.preventDefault();
		});
	}

	function update(self) {
		var curMode = self.cmeditor.getCurrentCMEditorMode();
		var cmMode = CodeMirror.findModeByName(curMode) || CodeMirror.findModeByMIME(curMode);
		self.rootElem.find(".modesMenu").find("span").removeClass("ui-icon ui-icon-check");
		self.rootElem.find(".modesMenu a[value='mode"+cmMode.name+"']").children("span").addClass("ui-icon ui-icon-check");

		if (self.cmeditor.getCodeMirror().getOption("readOnly")) {
			self.rootElem.find(".view a[value='readOnly'] span").addClass("ui-icon ui-icon-check");
			self.rootElem.find(".view a[value='addonfullscreen']").parent().addClass("ui-state-disabled");
		} else {
			self.rootElem.find(".view a[value='readOnly'] span").removeClass("ui-icon ui-icon-check");
			self.rootElem.find(".view a[value='addonfullscreen']").parent().removeClass("ui-state-disabled");
		}

	}

	CMEditorMenu.prototype.constructor = CMEditorMenu;
	CMEditorMenu.prototype.update = function(){update(this)};

	return CMEditorMenu;
})();
