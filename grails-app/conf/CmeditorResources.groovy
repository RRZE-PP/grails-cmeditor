modules = {


	'cmeditor-dependencies' {
		defaultBundle false

		dependsOn 'jsdifflib'

		resource url: 'lib/codemirror-5.3/lib/codemirror.css', disposition:'head'
		resource url: 'lib/codemirror-5.3/lib/codemirror.js', disposition:'head'

		// modes
		resource url: 'lib/codemirror-5.3/mode/htmlmixed/htmlmixed.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/mode/htmlembedded/htmlembedded.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/mode/css/css.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/mode/xml/xml.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/mode/javascript/javascript.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/mode/groovy/groovy.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/mode/clike/clike.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/mode/properties/properties.js', disposition:'head'

		// themes
		resource url: 'lib/codemirror-5.3/theme/eclipse.css', disposition:'head'
		resource url: 'lib/codemirror-5.3/theme/lesser-dark.css', disposition:'head'
		resource url: 'lib/codemirror-5.3/theme/monokai.css', disposition:'head'
		resource url: 'lib/codemirror-5.3/theme/night.css', disposition:'head'
		resource url: 'lib/codemirror-5.3/theme/the-matrix.css', disposition:'head'
		resource url: 'lib/codemirror-5.3/theme/twilight.css', disposition:'head'

		// keymaps
		resource url: 'lib/codemirror-5.3/keymap/vim.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/keymap/sublime.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/keymap/emacs.js', disposition:'head'

		// addon
		resource url: 'lib/codemirror-5.3/addon/dialog/dialog.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/dialog/dialog.css', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/edit/matchbrackets.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/edit/closebrackets.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/edit/closetag.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/search/search.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/search/searchcursor.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/mode/overlay.js', disposition:'head'
		// hint
		resource url: 'lib/codemirror-5.3/addon/hint/show-hint.css', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/hint/show-hint.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/hint/anyword-hint.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/hint/css-hint.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/hint/html-hint.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/hint/javascript-hint.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/hint/sql-hint.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/hint/xml-hint.js', disposition:'head'

		resource url: 'lib/codemirror-5.3/addon/comment/comment.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/comment/continuecomment.js', disposition:'head'

		resource url: 'lib/codemirror-5.3/addon/fold/foldcode.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/fold/foldgutter.css', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/fold/foldgutter.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/fold/brace-fold.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/fold/comment-fold.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/fold/indent-fold.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/fold/markdown-fold.js', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/fold/xml-fold.js', disposition:'head'

		resource url: 'lib/codemirror-5.3/addon/selection/active-line.js', disposition:'head'

		resource url: 'lib/codemirror-5.3/addon/display/fullscreen.css', disposition:'head'
		resource url: 'lib/codemirror-5.3/addon/display/fullscreen.js', disposition:'head'

		resource url:'/css/cmeditor-common.css', disposition:'head'
		resource url:'/js/cmeditor-common.js', disposition:'head'
	}

	'cmeditor-menu' {
		dependsOn 'jquery, jquery-ui'

		resource url:'/css/jquery/jquery.ui.menubar.css', disposition:'head'
		resource url:'/js/jquery/jquery.ui.menubar.js', disposition:'head'
		resource url:'/css/jquery/chosen.css', disposition:'head'
		resource url:'/js/jquery/chosen.jquery.js', disposition:'head'

		resource url:'/js/CMEditorMenu.js', disposition:'head'
	}

	'cmeditor-tabs' {
		dependsOn 'jquery, jquery-ui, cmeditor-dependencies, cmeditor-menu'

		resource url:'/js/CMEditor.js', disposition:'head'
	}

	'cmeditor-textarea' {
		dependsOn 'jquery, jquery-ui, cmeditor-dependencies, cmeditor-menu'

		resource url:'/js/textAreaCMEditor.js', disposition:'head'
	}

	'cmeditor' { dependsOn 'cmeditor-tabs, cmeditor-textarea' }

	'jsdifflib' {
		resource url:'/lib/jsdifflib/difflib.js', disposition:'head'
		resource url:'/lib/jsdifflib/diffview.css', disposition:'head'
		resource url:'/lib/jsdifflib/diffview.js', disposition:'head'
	}
}