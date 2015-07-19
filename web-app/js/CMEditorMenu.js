//= require jquery
//= require jquery-ui

//= require jquery/jquery.ui.menubar
//= require select2-4.0.0/dist/js/select2.min.js

this.CMEditorMenu = (function(){

	function CMEditorMenu(cmeditor, rootElem, options, instanceName){
		var self = this;
		self.instanceNo = CMEditorMenu.instanciated++;
		self.instanceName = instanceName !== undefined ? instanceName : "";

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

		registerInstance(self.instanceName, self.instanceNo, self);
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
			instance = " #" + arg0.instanceNo + " '" + arg0.instanceName +"'";
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
		self.fileMenu = {
			new: function(cm) { self.cmeditor.newDoc(); },
			open: function(cm) {

				self.openDialog.children().remove();
				var s = $("<select class=\"fileSelect\" name=\"cmeditor-menu-open-select\" multiple=\"multiple\" style=\"width:100%\"/>");

				if(self.options.ajax.listURL){
					$.get(self.options.ajax.listURL, function(data){
						if (data.status == "success") {
							var available = false
							var myButtons = {
								Cancel: function() { $(this).dialog( "close" ); },
							};
							for(var i=0; i < data.result.length; ++i) {
								if (self.cmeditor.getDocumentPositionByName(data.result[i]) == undefined) {
									s.append($("<option />", {value: data.result[i][self.options.mapping["idField"]], text: data.result[i][self.options.mapping["name"]]}));
									available = true;
								}
							}
							if (available == true) {
								s.appendTo(self.openDialog);
								self.openDialog.find(".fileSelect").select2({placeholder: "Select a file",
  																			 allowClear: true})

								//workaround a width calculation bug in select2
								self.openDialog.find(".select2-search__field").css("width", "auto");

								myButtons.Open = function() {
									var vals = self.openDialog.find(".fileSelect").val();
									for (var i in vals) {
										self.cmeditor.ajax_load(vals[i]);
									}
									$(this).dialog( "close" );
								};
							} else {
								s = $("<p class=\"noFiles\" name=\"cmeditor-menu-open-no-files\">No files available.</p>");
								s.appendTo(self.openDialog);
							}

							self.openDialog.dialog("option", "buttons", myButtons);
							self.openDialog.dialog("open");
						} else {
							self.cmeditor.displayMessage(data.msg);
						}
					}).fail(function(XMLHttpRequest,textStatus,errorThrown){self.cmeditor.displayMessage("An error occured: "+ textStatus +" " + errorThrown);});
				}
			},
			save: function(cm) { self.cmeditor.saveDoc(); },
			saveas: function(cm) { self.cmeditor.saveDocAs(); },
			rename: function(cm) {
				var name = prompt("Name of the new buffer", "");
				if (name == null) return;
				if (!name) name = "test";
				self.cmeditor.renameDoc(self.cmeditor.getUnambiguousName(name));
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

		self.viewMenu = {
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
			goto: function(cm) { self.cmeditor.goto() },
			addonfullscreen: function(cm) {
				if (!cm.getOption("readOnly")) {
					self.cmeditor.toggleFullscreen();
		        }
		    }
		}

		//add available modes dynamically
		var modesMenuElem = self.rootElem.find(".modesMenu");
		if(self.options.availableModes === undefined){
			self.options.availableThemes = [];
		}
		function getModeCallback(self, mode, mimetype){
			return function(cm){CMEditor.loadMode(mode, function(){self.cmeditor.codeMirror.setOption("mode", mimetype); self.cmeditor.update();})};
		}
		for(var i=0; i < self.options.availableModes.length; i++){
			var mode = self.options.availableModes[i];
			var modename = mode;
			var mimetype = mode;
			var clike = {
			"c":"text/x-csrc",
			"c++":"text/x-c++src",
			"java":"text/x-java",
			"c#":"text/x-csharp",
			"objective-c":"text/x-objectivec",
			"scala":"text/x-scala",
			"vertex":"text/x-vertex",
			"fragment":"x-shader/x-fragment"};
			if(mode in clike){
				mimetype = clike[mode];
				mode = "clike";
			}
			self.viewMenu["mode"+modename] = getModeCallback(self, mode, mimetype);
			modesMenuElem.append('<li><a href="#" value="mode'+modename+'"><span></span>'+modename+'</a></li>');
		}


		self.optionsMenu = {
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
			self.optionsMenu["theme"+theme] = getThemeCallback(self, theme);
			themesMenuElem.append('<li><a href="#" value="theme'+theme+'"><span></span>'+theme+'</a></li>');
		}


		self.addonsMenu = {
			addondonation: function(cm) {
				self.donationDialog.dialog("open");
			},
		};
	}

	/*
	 * Initialises the modal dialogs
	 */
	function initDialogs(self){
		self.donationDialog = self.rootElem.find(".donationDialog").dialog({
					autoOpen: false,
					height: 300,
					buttons: {
						Yes: function() { $( this ).dialog( "close" ); },
						No: function() { $( this ).dialog( "close" ); },
					},
				});

		self.openDialog = self.rootElem.find(".openMenu").dialog({
					autoOpen: false,
					height: 300
				});

	}

	/*
	 * Adds items to the menu which the user defined via options
	 */
	function addUserDefinedItems(self) {
		if(self.options.addModes){
			for (var i = self.options.addModes.length - 1; i >= 0; i--) {
				var mode = self.options.addModes[i];

				var s = $("<li><a href=\"#\" value=\"mode"+mode+"\"><span></span>"+mode+"</a></li>");
				s.appendTo(self.rootElem.find(".modesMenu"));
				self.viewMenu["mode"+mode] = function(name) {
					return function(cm) { cm.setOption("mode", name); };
				}(mode);
			}
		}

		if (typeof self.options.overlayDefinitionsVar !== "undefined") {
			for(var name in self.options.overlayDefinitionsVar) {
				var s = $("<li><a href=\"#\" value=\"mode"+name+"\"><span></span>"+name+"</a></li>");
				s.appendTo(self.rootElem.find(".modesMenu"));
				self.viewMenu["mode"+name] = function(name) {
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
			var found = self.fileMenu[$(this).attr("value")];
		    self.cmeditor.focus();

		    if (found) found(self.cmeditor.getCodeMirror());

			event.preventDefault();
		});

		self.rootElem.find(".viewMenu a").click(function(event) {
			var found = self.viewMenu[$(this).attr("value")];
		    self.cmeditor.focus();

		    if (found) found(self.cmeditor.getCodeMirror());

		    if ($(this).attr("value").indexOf("mode") == 0) {
				$(this).parent().parent().find("span").removeClass("ui-icon ui-icon-check");
				$(this).children("span").addClass("ui-icon ui-icon-check");
		    }
		    if ($(this).attr("value").indexOf("readOnly") == 0) {
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
			if ($(this).attr("value").indexOf("diffBeforeSave") == 0) {
				if ($(this).children("span").hasClass("ui-icon-check")) {
					$(this).children("span").removeClass("ui-icon ui-icon-check");
				} else {
					$(this).children("span").addClass("ui-icon ui-icon-check");
				}
			} else {
				$(this).parent().parent().find("span").removeClass("ui-icon ui-icon-check");
				$(this).children("span").addClass("ui-icon ui-icon-check");
			}

			var found = self.optionsMenu[$(this).attr("value")];
		    self.cmeditor.focus();

		    if (found) found(self.cmeditor.getCodeMirror())

			if(self.options.useSession){
			    if ($(this).attr("value").indexOf("binding") == 0) {localStorage["cmeditor-menu-binding"] = $(this).attr("value").substring(7);}
			    if ($(this).attr("value").indexOf("theme") == 0) {localStorage["cmeditor-menu-theme"] = $(this).attr("value").substring(5);}
			    if ($(this).attr("value").indexOf("diffBeforeSave") == 0) {localStorage["cmeditor-menu-diffBeforeSave"] = $(this).children("span").hasClass("ui-icon-check");}
			}
		    //return false;
		    event.preventDefault();
		});

		self.rootElem.find(".addonsMenu a").click(function(event) {
			var found = self.addonsMenu[$(this).attr("value")];
		    self.cmeditor.focus();
		    if (found) found(self.cmeditor.getCodeMirror());

		    event.preventDefault();
		});
	}

	function update(self) {
		self.rootElem.find(".modesMenu").find("span").removeClass("ui-icon ui-icon-check");
		self.rootElem.find(".modesMenu a[value='mode"+self.cmeditor.getCurrentCMEditorMode()+"']").children("span").addClass("ui-icon ui-icon-check");

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
