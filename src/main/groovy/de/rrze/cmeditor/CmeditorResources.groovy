modules = {


	'cmeditor-dependencies' {
		defaultBundle false

		dependsOn 'jsdifflib'

		resource url: 'lib/codemirror/lib/codemirror.css', disposition:'head'
		resource url: 'lib/codemirror/lib/codemirror.js', disposition:'head'

		// keymaps
		resource url: 'lib/codemirror/keymap/vim.js', disposition:'head'
		resource url: 'lib/codemirror/keymap/sublime.js', disposition:'head'
		resource url: 'lib/codemirror/keymap/emacs.js', disposition:'head'

		resource url: 'lib/codemirror/mode/meta.js', disposition:'head'

		// addon
		resource url: 'lib/codemirror/addon/dialog/dialog.js', disposition:'head'
		resource url: 'lib/codemirror/addon/dialog/dialog.css', disposition:'head'
		resource url: 'lib/codemirror/addon/edit/matchbrackets.js', disposition:'head'
		resource url: 'lib/codemirror/addon/edit/closebrackets.js', disposition:'head'
		resource url: 'lib/codemirror/addon/edit/closetag.js', disposition:'head'
		resource url: 'lib/codemirror/addon/search/search.js', disposition:'head'
		resource url: 'lib/codemirror/addon/search/searchcursor.js', disposition:'head'
		resource url: 'lib/codemirror/addon/mode/overlay.js', disposition:'head'
		resource url: 'lib/codemirror/addon/mode/multiplex.js', disposition:'head'
		resource url: 'lib/codemirror/addon/mode/loadmode.js', disposition:'head'
		// hint
		resource url: 'lib/codemirror/addon/hint/show-hint.css', disposition:'head'
		resource url: 'lib/codemirror/addon/hint/show-hint.js', disposition:'head'
		resource url: 'lib/codemirror/addon/hint/anyword-hint.js', disposition:'head'
		resource url: 'lib/codemirror/addon/hint/css-hint.js', disposition:'head'
		resource url: 'lib/codemirror/addon/hint/html-hint.js', disposition:'head'
		resource url: 'lib/codemirror/addon/hint/javascript-hint.js', disposition:'head'
		resource url: 'lib/codemirror/addon/hint/sql-hint.js', disposition:'head'
		resource url: 'lib/codemirror/addon/hint/xml-hint.js', disposition:'head'

		resource url: 'lib/codemirror/addon/comment/comment.js', disposition:'head'
		resource url: 'lib/codemirror/addon/comment/continuecomment.js', disposition:'head'

		resource url: 'lib/codemirror/addon/fold/foldcode.js', disposition:'head'
		resource url: 'lib/codemirror/addon/fold/foldgutter.css', disposition:'head'
		resource url: 'lib/codemirror/addon/fold/foldgutter.js', disposition:'head'
		resource url: 'lib/codemirror/addon/fold/brace-fold.js', disposition:'head'
		resource url: 'lib/codemirror/addon/fold/comment-fold.js', disposition:'head'
		resource url: 'lib/codemirror/addon/fold/indent-fold.js', disposition:'head'
		resource url: 'lib/codemirror/addon/fold/markdown-fold.js', disposition:'head'
		resource url: 'lib/codemirror/addon/fold/xml-fold.js', disposition:'head'

		resource url: 'lib/codemirror/addon/selection/active-line.js', disposition:'head'

		resource url: 'lib/codemirror/addon/display/fullscreen.css', disposition:'head'
		resource url: 'lib/codemirror/addon/display/fullscreen.js', disposition:'head'

		resource url: 'lib/jquery-layout-1.4.0/layout-default-latest.css'
		resource url: 'lib/jquery-layout-1.4.0/jquery.layout-latest.js'

		resource url:'/css/cmeditor-common.css', disposition:'head'
		resource url:'/js/cmeditor-common.js', disposition:'head'
	}

	'cmeditor-menu' {
		dependsOn 'jquery, jquery-ui, jquery-ui-scopedTheme'

		resource url:'/css/jquery/jquery.ui.menubar.css', disposition:'head'
		resource url:'/js/jquery/jquery.ui.menubar.js', disposition:'head'
		resource url:'lib/select2-4.0.0/dist/js/select2.min.js', disposition:'head'
		resource url:'lib/select2-4.0.0/dist/css/select2.min.css', disposition:'head'

		resource url:'lib/jqueryfiletree-2.0.1/src/jQueryFileTree.js', disposition:'head'
		resource url:'lib/jqueryfiletree-2.0.1/dist/jQueryFileTree.min.css', disposition:'head'

		resource url:'lib/spin-2.3.2/spin.min.js', disposition:'head'

		resource url:'/js/CMEditorMenu.js', disposition:'head'
	}

	'cmeditor-tabs' {
		dependsOn 'jquery, jquery-ui, jquery-ui-scopedTheme, cmeditor-dependencies, cmeditor-menu'

		resource url:'/js/CMEditor-src.js', disposition:'head'
	}

	'cmeditor-textarea' {
		dependsOn 'jquery, jquery-ui, jquery-ui-scopedTheme, cmeditor-dependencies, cmeditor-menu'

		resource url:'/js/textAreaCMEditor.js', disposition:'head'
	}

	'cmeditor' { dependsOn 'cmeditor-tabs, cmeditor-textarea' }

	'jsdifflib' {
		resource url:'/lib/jsdifflib/difflib.js', disposition:'head'
		resource url:'/lib/jsdifflib/diffview.css', disposition:'head'
		resource url:'/lib/jsdifflib/diffview.js', disposition:'head'
	}

	'jquery-ui-scopedTheme' {
		resource url:'/lib/jquery-ui-1.10.4.custom/css/cmeditor/jquery-ui-1.10.4.custom.css', disposition:'head'
	}
}
