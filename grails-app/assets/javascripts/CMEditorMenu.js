//= require select2-4.0.0/dist/js/select2.min.js

if(typeof String.prototype.endsWith === "undefined")
	String.prototype.endsWith = function(suffix) {
	    return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};

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
		registerMenuCallbacks(self);
		decorateMenuItems(self);
		initDialogs(self);


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

                self.dialogs.newFileDialog.find("button.mainButton").unbind('click').click(function() {
					var name = nameElem.val().trim();
					var folder = folderElem.val().trim();

					if(name === ""){
						alert(self.options.menu.messages.errors.supplyaname);
						return;
					}
					if(folder === ""){
						folder = null;
						self.cmeditor.displayMessage(self.options.menu.messages.hints.filewillbehidden, "warn");
					}else{
						folder = folder.endsWith("/")?folder:folder+"/"
					}

					var unambigousName = self.cmeditor.getUnambiguousName(name, folder);
					if(name !== unambigousName){
						self.cmeditor.displayMessage(self.options.menu.messages.hints.numberappended, "warn");
					}

					self.cmeditor.newDoc(unambigousName, folder);
					self.dialogs.newFileDialog.modal("hide");
				});

				self.dialogs.newFileDialog.modal('show');
			},
			open: function(cm) {

				var errorMsg = self.dialogs.openDialog.find(".noFiles");
				errorMsg.hide(0).siblings().remove();

				var dialogContent = self.dialogs.openDialog.find('.modal-body');

				var s = $("<select class=\"fileSelect\" name=\"cmeditor-menu-open-select\" multiple=\"multiple\" style=\"width:100%\"/><div class=\"fileSelectTree\" />");

				if(self.options.ajax.listURL){
					$.get(self.options.ajax.listURL, function(data){
						if (data.status == "success") {
							var available = (data.result.length > 0);
							var buttons = {};

							// prepare Select2
							for(var i=0; i < data.result.length; ++i) {
								s.append($("<option />", {value: data.result[i][self.options.mapping["idField"]], text: data.result[i][self.options.mapping["name"]]}));
							}

							// prepare Filetree
							if (available == true) {
								s.appendTo(dialogContent);
								self.dialogs.openDialog.find(".fileSelect").select2({placeholder: self.options.menu.messages.fileselectplaceholder,
																			 allowClear: true});

								self.dialogs.openDialog.find(".fileSelectTree").fileTree({script:function(fileTreeData){
									//this is called each time the user opens a directory (including root)
									var val = $('<ul class="jqueryFileTree" style="display: none;"></ul>');

									var curPathElems = fileTreeData.dir.split("/");
									var folders = {};
									var files = [];

									for (var i=0; i < data.result.length; ++i) {
										if (typeof data.result[i][self.options.mapping["folder"]] !== "undefined" &&
											data.result[i][self.options.mapping["folder"]] !== null) {

											var absPath = data.result[i][self.options.mapping["folder"]];
											absPath = absPath.endsWith("/") ? absPath : absPath+"/";

											if (absPath === fileTreeData.dir) {
												//this file is in the current folder
												var fileName = data.result[i][self.options.mapping["name"]];
												var fileId = data.result[i][self.options.mapping["idField"]];
												files.push({fileId: fileId, fileName:fileName});
											}else{
												var pathElems = absPath.split("/");

												if (absPath.startsWith(fileTreeData.dir) && pathElems.length > curPathElems.length){
													//this file is in a subfolder. save it and append it later on, each folder only once
													var curPathDepth = curPathElems.length-1;
													var subfolderPath = (pathElems.slice(0, curPathDepth+1).join("/"))+"/";
													folders[subfolderPath] = pathElems[curPathDepth];
												}
											}
										}
									}

									var sortedFiles = files.sort(function(a, b) {
										var nameA = a.fileName.toUpperCase();
                                        var nameB = b.fileName.toUpperCase();

                                        if (nameA < nameB) {
                                            return -1;
                                        }
                                        if (nameA > nameB) {
                                            return 1;
                                        }

                                        return 0;
									});

									for (var i = 0; i < sortedFiles.length; i++) {
										var file = sortedFiles[i];
                                        val.append($('<li class="file ext_'+file.fileName+'"><a href="#" rel='+file.fileId+'>'+file.fileName+'</a></li>'));
									}

									var sortedAbsPaths = Object.keys(folders).sort();
									for (var i = 0; i < sortedAbsPaths.length; i++) {
										var absPath = sortedAbsPaths[i];
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

                                self.dialogs.openDialog.find("button.mainButton").unbind('click').click(function() {
                                    var vals = self.dialogs.openDialog.find(".fileSelect").val();
                                    for (var i in vals) {
                                        self.cmeditor.open(vals[i]);
                                    }
                                    self.dialogs.openDialog.modal('hide');
                                });

							} else {
								errorMsg.show(0)
							}

							self.dialogs.openDialog.modal('show');
						} else {
							self.cmeditor.displayMessage(data.msg ? data.msg : "An unknown error occured", "error");
						}
					}).fail(function(XMLHttpRequest,textStatus,errorThrown){
						self.cmeditor.displayMessage(self,
							'<div class="cmeditor-error-message">'+self.options.messages.errorIntro+'</div>' +
							XMLHttpRequest.responseText, "error");

					});
				}
			},
			save: function(cm) { self.cmeditor.saveDoc(); },
			saveas: function(cm) { self.cmeditor.saveDocAs(); },
			rename: function(cm) {
				var newNameElem = self.dialogs.renameDialog.find("input[name=newName]");
				var newFolderElem = self.dialogs.renameDialog.find("input[name=newFolder]");

				var oldName = self.cmeditor.state.curDoc.getName();
				var oldFolder = self.cmeditor.state.curDoc.getFolder();

				newNameElem.val(oldName);
				newFolderElem.val(oldFolder);

				var buttons = {};
                self.dialogs.renameDialog.find("button.mainButton").unbind('click').click(function() {
					var newName = newNameElem.val().trim();
					var newFolder = newFolderElem.val().trim();

					if(newName === ""){
						alert(self.options.menu.messages.errors.supplyaname);
						return;
					}
					if(newFolder === ""){
						newFolder = null;
						self.cmeditor.displayMessage(self.options.menu.messages.hints.filewillbehidden, "warn");
					}else{
						newFolder = newFolder.endsWith("/")?newFolder:newFolder+"/";
					}

					if(newName !== oldName || newFolder !== oldFolder){
						var unambigousName = self.cmeditor.getUnambiguousName(newName, newFolder);

						self.cmeditor.moveDoc(newFolder);
						self.cmeditor.renameDoc(unambigousName);

						if(newName !== unambigousName){
							self.cmeditor.displayMessage(self.options.menu.messages.hints.numberappended, "warn");
						}
					}

					self.dialogs.renameDialog.modal("hide");
				});

				self.dialogs.renameDialog.modal("show");
			},
			delete: function(cm) { self.cmeditor.deleteDoc(); },
			import: function(){
				var fileElem = self.dialogs.importDialog.find("input[type=file]");
				var fileNameElem = self.dialogs.importDialog.find(".fileName");
				var fileList = null;

				fileElem.on("change", function(e){fileList = e.target.files});
				fileElem.val("");

				if(typeof self.dialogs.importDialog.spinner === "undefined"){
					var opts = {lines: 9, width: 12, length: 0 , radius: 18, corners: 0.9,
					            opacity: 0, trail: 79, shadow: true, className: ""}
					self.dialogs.importDialog.spinner = new Spinner(opts);
					self.dialogs.importDialog.spinner.spin(self.dialogs.importDialog.find(".cmeditor-spinner").get(0));
				}

				self.dialogs.importDialog.spinner.stop();

				var buttons = {};
                self.dialogs.importDialog.find("button.mainButton").unbind('click').click(function() {
					if(fileList === null || fileList.length === 0){
						alert(self.options.menu.messages.errors.selectafile);
						return;
					}

					self.dialogs.importDialog.spinner.spin(self.dialogs.importDialog.find(".cmeditor-spinner").get(0));

					var filesToLoad = fileList.length;
					for(var i=0; i<fileList.length; i++){

						var fileReader = new FileReader();
						fileReader.onload = function(origFile){
							return function(e){
									var unambigousName = self.cmeditor.getUnambiguousName(origFile.name, "/imported/");
									if(origFile.name !== unambigousName){
										self.cmeditor.displayMessage(self.options.menu.messages.hints.numberappended, "warn");
									}

									self.cmeditor.importDoc(unambigousName, e.target.result, origFile.type);

									filesToLoad--;
									if(filesToLoad == 0){
										self.dialogs.importDialog.modal("hide");
									}
							}
						}(fileList[i]);

						fileReader.readAsText(fileList[i]);
					}

				});

				self.dialogs.importDialog.modal("show");
			},
			export: function(){
				self.cmeditor.exportDoc();
			},
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
				if(self.cmeditor.isReadOnly()){
					//if the whole editor is read only, this cannot be changed!
					return;
				}

				if(self.cmeditor.getCurDoc){
					self.cmeditor.getCurDoc().setReadOnly(!self.cmeditor.getCurDoc().isReadOnly())
				}else{
					//this is a textAreaCMEditor
					if(self.cmeditor.getCodeMirror().getOption("readOnly") === "noCursor")
						self.cmeditor.getCodeMirror().setOption("readOnly", "");
					else
						self.cmeditor.getCodeMirror().setOption("readOnly", "noCursor");
				}
				self.cmeditor.update();
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

				self.dialogs.gotoDialog.find(".gotoLabel").text(" ("+first+".."+last+"):");

				var buttons = {};

                self.dialogs.gotoDialog.find("button.mainButton").unbind('click').click(function() {
					var line = parseInt(input.val());

					if(isNaN(line) || line < first || line > last){
						alert(self.options.menu.messages.errors.validlineno);
						return;
					}

					self.dialogs.gotoDialog.modal("hide");
					self.cmeditor.codeMirror.setCursor(line-1, 0);
				});

				self.dialogs.gotoDialog.modal("show");
			 },
			showLog: function(cm) {
				$('#logContainer').toggle();
			},
			fullscreen: function(cm) {
				self.cmeditor.toggleFullscreen();
		    }
		};

        self.menus.modesMenu = {}

		//add available modes dynamically
		var modesMenuElem = self.rootElem.find(".modesMenu");
		if(self.options.availableModes === undefined){
			self.options.availableModes = [];
		}

        self.options.availableModes.sort();
		for (var i=0; i < self.options.availableModes.length; i++) {
			var mode = self.options.availableModes[i];
			var cmMode = CodeMirror.findModeByName(mode) || CodeMirror.findModeByMIME(mode);

			if(cmMode === undefined){
				log(self, "Could not add mode "+mode+", because no valid corresponding mode was found!");
				continue;
			}
			self.menus.modesMenu["mode"+cmMode.name] = (function(cmMode){return function(){self.cmeditor.setMode(cmMode.name)}})(cmMode);
			modesMenuElem.append('<a class="dropdown-item" href="#" value="mode'+cmMode.name+'">'+cmMode.name+'</a>');
		}

        modesMenuElem.append('<div class="dropdown-divider disabled"></div>');

		//treat overlays as modes
		if (typeof self.options.overlayDefinitionsVar !== "undefined") {
			var sortedOverlays = Object.keys(self.options.overlayDefinitionsVar).sort();
            for (var i = 0; i < sortedOverlays.length; i++) {
				var overlay = sortedOverlays[i];
				self.menus.modesMenu["mode"+overlay] = function(overlay) {
					return function(cm) {
					 	self.cmeditor.setMode(overlay)
					};
				}(overlay);

				modesMenuElem.append($("<a class='dropdown-item' href=\"#\" value=\"mode"+overlay+"\">"+overlay+"</a>"));
			}
		}


		self.menus.optionsMenu = {
			diffBeforeSave: function(cm) {
				if(typeof self.cmeditor.setDoDiffBeforeSaving == "function")
					self.cmeditor.setDoDiffBeforeSaving(self.rootElem.find(".optionsMenu a[value='diffBeforeSave']").hasClass("active")); },
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
		self.options.availableThemes.sort().reverse();
		for(var i=0; i < self.options.availableThemes.length; i++){
			var theme = self.options.availableThemes[i];
			self.menus.optionsMenu["theme"+theme] = getThemeCallback(self, theme);
			themesMenuElem.after('<a class="dropdown-item" data-group="themes" href="#" value="theme'+theme+'">'+theme+'</a>');
		}
	}

	/*
	 * Initialises the modal dialogs
	 */
	function initDialogs(self){
		var container = $('#dialogContainerElement');

		var defaultDialogConf = { show: false, backdrop: false };
		self.dialogs = {};

		self.dialogs.openDialog = container.find(".openMenu").modal(defaultDialogConf);
		self.dialogs.renameDialog = container.find(".renameDialog").modal(defaultDialogConf);
		self.dialogs.newFileDialog = container.find(".newFileDialog").modal(defaultDialogConf);
		self.dialogs.gotoDialog = container.find(".gotoDialog").modal(defaultDialogConf);
		self.dialogs.importDialog = container.find(".importDialog").modal(defaultDialogConf);

		// .cmeditor-ui-dialog s have the defaultButton-thingie activated
		$.each(self.dialogs, function(key, val) {
			val.parent().addClass("cmeditor-ui-dialog");
		});
	}

	/*
	 * Marks or grays out some menu items depending on their values
	 */
	function decorateMenuItems(self){
		self.rootElem.find(".modesMenu a[value='mode"+self.options.mode+"']").addClass("active");

		if(self.options.useSession){
			if (localStorage["cmeditor-menu-binding"])
				self.rootElem.find(".optionsMenu a[value='binding"+localStorage["cmeditor-menu-binding"]+"']").addClass("active");
			else
				self.rootElem.find(".optionsMenu a[value='bindingdefault']").addClass("active");

			if (localStorage['cmeditor-menu-theme'])
				self.rootElem.find(".optionsMenu a[value='theme"+localStorage['cmeditor-menu-theme']+"']").addClass("active");
			else
				self.rootElem.find(".optionsMenu a[value='themedefault']").addClass("active");

			if (localStorage['cmeditor-menu-diffBeforeSave'] === true)
				self.rootElem.find(".optionsMenu a[value='diffBeforeSave']").addClass("active");
			else if (self.options.defaultDiffBeforeSave)
				self.rootElem.find(".optionsMenu a[value='diffBeforeSave']").addClass("active");

		}else{
			self.rootElem.find(".optionsMenu a[value='binding"+self.options.binding+"']").addClass("active");
			self.rootElem.find(".optionsMenu a[value='theme"+self.options.theme+"']").addClass("active");

			if(self.options.defaultDiffBeforeSave){
				self.rootElem.find(".optionsMenu a[value='diffBeforeSave']").addClass("active");
			}
		}

		if (self.options.defaultReadOnly) {
			self.rootElem.find(".viewMenu a[value='readOnly']").addClass("active");
		}

		if (self.cmeditor.isReadOnly()) {
			//disable some additional elements, when the whole editor is readonly
			self.rootElem.find(".viewMenu a[value='readOnly']").addClass("active");
			self.rootElem.find(".viewMenu a[value='readOnly']").addClass("disabled");
			self.rootElem.find(".fileMenu a[value='new']").addClass("disabled");
			self.rootElem.find(".fileMenu a[value='open']").addClass("disabled");
			self.rootElem.find(".fileMenu a[value='import']").addClass("disabled");
			self.rootElem.find(".fileMenu a[value='close']").addClass("disabled");
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

			if(typeof value === "undefined" || $(this).hasClass("disabled")){
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

			if(typeof value === "undefined" || $(this).hasClass("disabled")){
		    	event.preventDefault();
				return;
			}

			var found = self.menus.viewMenu[value];
		    self.cmeditor.focus();

		    if (found) found(self.cmeditor.getCodeMirror());
			event.preventDefault();
		});

        self.rootElem.find(".modesMenu a").click(function(event) {
            var value = $(this).attr("value");

            if(typeof value === "undefined" || $(this).hasClass("disabled")){
                event.preventDefault();
                return;
            }

            $(this).parent().find("a").removeClass("active");
            $(this).addClass("active");

            var found = self.menus.modesMenu[value];
            self.cmeditor.focus();

            if (found) found(self.cmeditor.getCodeMirror());
            event.preventDefault();
        });

		self.rootElem.find(".optionsMenu a").click(function(event) {
			var value = $(this).attr("value");

			if(typeof value === "undefined" || $(this).hasClass("disabled")){
		    	event.preventDefault();
				return;
			}

			if (value.indexOf("diffBeforeSave") == 0) {
				$(this).toggleClass('active');
			} else {
				var groupName = $(this).attr('data-group');
				$(this).parent().find("a[data-group='"+groupName+"']").removeClass("active");
				$(this).addClass("active");
			}

			var found = self.menus.optionsMenu[value];
		    self.cmeditor.focus();

		    if (found) found(self.cmeditor.getCodeMirror())

			if(self.options.useSession){
			    if (value.indexOf("binding") == 0) {localStorage["cmeditor-menu-binding"] = value.substring(7);}
			    if (value.indexOf("theme") == 0) {localStorage["cmeditor-menu-theme"] = value.substring(5);}
			    if (value.indexOf("diffBeforeSave") == 0) {localStorage["cmeditor-menu-diffBeforeSave"] = $(this).hasClass("active");}
			}
		    //return false;
		    event.preventDefault();
		});

		self.rootElem.find(".addonsMenu a").click(function(event) {
			var value = $(this).attr("value");

			if(typeof value === "undefined" || $(this).hasClass("disabled")){
		    	event.preventDefault();
				return;
			}

			var found = self.menus.addonsMenu[value];
		    self.cmeditor.focus();
		    if (found) found(self.cmeditor.getCodeMirror());

		    event.preventDefault();
		});
	}

	/*
	 * Returns true if either this menu's editor or its current document is read-only
	 */
	function isEditorOrDocReadOnly(self){
		return self.cmeditor.isReadOnly()
			 || (self.cmeditor.getCurDoc && self.cmeditor.getCurDoc().isReadOnly())
			 || (typeof self.cmeditor.getCurDoc === "undefined" && self.cmeditor.getCodeMirror().getOption("readOnly") === "noCursor");
	}

	function update(self) {
		var curMode = self.cmeditor.getCurrentCMEditorMode();
		var cmMode = CodeMirror.findModeByName(curMode) || CodeMirror.findModeByMIME(curMode) || {name: curMode};

		self.rootElem.find(".modesMenu").find('a').removeClass("active");
		if(typeof cmMode !== "undefined")
			self.rootElem.find(".modesMenu a[value='mode"+cmMode.name+"']").addClass("active");

		if (isEditorOrDocReadOnly(self)) {
			self.rootElem.find(".viewMenu a[value='readOnly']").addClass("active");
			self.rootElem.find(".disabledWhenReadOnly").addClass("disabled");
		} else {
			self.rootElem.find(".viewMenu a[value='readOnly']").removeClass("active");
			self.rootElem.find(".disabledWhenReadOnly").removeClass("disabled");
		}

	}

	/* (Public)
	 *
	 * Appends an entry to the menu bar
	 *
	 * Parameters: menuName (String): the new menu's name
	 *
	 * Returns: A handle which can be used to add new submenu entries with `addSubMenuEntry`
	 */
	function addRootMenuEntry(self, menuName){
		if(typeof self.menus.userAddedMenus === "undefined")
			self.menus.userAddedMenus = {};

		if(typeof self.menus.userAddedMenus[menuName] === "undefined"){
			var menuEntry = $("<li class='nav-item dropdown'>" +
				"<a class='dropdown-toggle nav-link userAddedRootMenu' href='#' id='UserAddedMenu_"+menuName+"' role='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>"+menuName+"</a>" +
				"<div class='dropdown-menu userAddedMenu scrollable-menu' aria-labelledby='UserAddedMenu_'"+menuName+"'></div>" +
				"</li>");
			self.rootElem.find(".cmeditor-menubar").find('ul.navbar-nav').append(menuEntry);

			self.menus.userAddedMenus[menuName] = menuEntry;

			menuEntry._cmeditor_menu_isAUserAddedMenu = true;
		}

		return self.menus.userAddedMenus[menuName];
	}

	/* (Public)
	 *
	 * Appends a submenu entry to the menu bar
	 *
	 * Parameters: superMenu Object: a handle returned by this method or `addRootMenuEntry`
	 *             menuName String: the new menu entry's name
	 *             callbackFunction function (optional): if supplied, this function will be called
	 *                                                   when the entry is clicked
	 *
	 * Returns: A handle which can be used to add new sub-submenu entries with this method
	 */
	function addSubMenuEntry(self, superMenu, entryName, callbackFunction){
		if(typeof superMenu._cmeditor_menu_isAUserAddedMenu === "undefined"){
			console.log("Warning: superMenu is not a valid menu entry");
			return null;
		}

		// if(superMenu.children(".userAddedMenu").length === 0)
		// 	superMenu.append($("<ul class='userAddedMenu'></ul>"));

		var subMenuEntry = $("<a class='dropdown-item' href='#'><span></span>"+entryName+"</a>");

		if(typeof callbackFunction === "function")
            subMenuEntry.on("click", callbackFunction);
		else
            subMenuEntry.on("click", function(e){e.preventDefault()});

		superMenu.children(".userAddedMenu").append(subMenuEntry);

		subMenuEntry._cmeditor_menu_isAUserAddedMenu = true;

		return subMenuEntry;
	}

	/* (Public)
	 *
	 * Appends a submenu entry divider
	 *
	 * Parameters: superMenu Object: a handle returned by this method or `addRootMenuEntry`
	 *             menuName String: the new menu entry's name
	 *             callbackFunction function (optional): if supplied, this function will be called
	 *                                                   when the entry is clicked
	 *
	 * Returns: A handle which can be used to add new sub-submenu entries with this method
	 */
	function addSubMenuDivider(self, superMenu){
		if(typeof superMenu._cmeditor_menu_isAUserAddedMenu === "undefined"){
			console.log("Warning: superMenu is not a valid menu entry");
			return null;
		}

		// if(superMenu.children(".userAddedMenu").length === 0)
		// 	superMenu.append($("<ul class='userAddedMenu'></ul>"));

		var subMenuEntry = $("<a class='dropdown-item disabled' href='#'><div class='dropdown-divider disabled'></div></a>");
		subMenuEntry.on("click", function(e){e.preventDefault()});

		superMenu.children(".userAddedMenu").append(subMenuEntry);

		subMenuEntry._cmeditor_menu_isAUserAddedMenu = true;

		return subMenuEntry;
	}

	CMEditorMenu.prototype.constructor = CMEditorMenu;
	CMEditorMenu.prototype.update = function(){update(this)};
	CMEditorMenu.prototype.addRootMenuEntry = function(){Array.prototype.unshift.call(arguments, this); return addRootMenuEntry.apply(this, arguments)};
	CMEditorMenu.prototype.addSubMenuEntry = function(){Array.prototype.unshift.call(arguments, this); return addSubMenuEntry.apply(this, arguments)};
	CMEditorMenu.prototype.addSubMenuDivider = function(){Array.prototype.unshift.call(arguments, this); return addSubMenuDivider.apply(this, arguments)};

	return CMEditorMenu;
})();
