# CMEditor
CMEditor is a simple way to use the popular CodeMirror web editor in grails applications. You can use it to edit pretty much anything that can be mapped to a file-like object. I.e. something with a filename and text-content. If your model requires additional fields this is supported, too.

For example managing your library could be done by mapping filename to "$author - $title". The tabbed editor then could manage everything: Author, title, publication year and - of course - the books content in a nice-to-use CodeMirror editor. You could even edit multiple books simultaneously.

Check out our [demo grails project](https://github.com/RRZE-PP/grails-cmeditor-demo).

## Cloning and checking out
After cloning this repo you'll have to run `grails upgrade` to regenerate some files in the web-app/WEB-INF folder.

## Usage
Add cmeditor as a plugin to your grails project's conf/BuildConfig.groovy:
```
    plugins {
        compile 'cmeditor:latest.release'
    }
```

Include the plugin's resources using either the resources or assets plugin:
```

	<r:require modules="cmeditor" />
	<!-- or -->
	<asset:javascript src="cmeditor.js"/>
	<asset:stylesheet href="cmeditor.css"/>

```

When adding a textarea or tabbed editor you have to supply a `name`-attribute. After document initialization you can access the corresponding javascript CMEditor-object by calling `CMEditor.getInstance("<nameAttributeValue>)"`. For an API of the class see the CMEditor.js file in grails-app/js/web-app/js/.

### Tabbed Editor
The tabbed editor is useful to edit more than one file at once. They are loaded and stored seamlessly using ajax to a controller of your choice.

For further documentation please visit [our project wiki](https://github.com/RRZE-PP/grails-cmeditor/wiki/Tabbed-Editor) for information on the API.

If you need additional input fields, you can provide them in the body of the tag. All elements with the class `cmeditor-field` there will be serialized using their name as key and sent along with the document's content.

A simple example would look like this:
```gsp
    <cmeditor:tabs name="book" options="[defaultContent:'Lorem ipsum sit dolor']" ajax="[getURL:createLink(action: 'ajaxGet')+'?name=']">
      <label for="author"> <g:message code="myLibrary.author.label" default="Author" /></label>
      <g:textField name="author" class="cmeditor-field" /> <br />

      <label for="title"><g:message code="myLibrary.title.label" default="Title" /></label>
      <g:textField name="title" class="cmeditor-field" />
    </cmeditor:tabs>
```

The resulting CMEditor would be similar to this:
![Recorded demo](https://raw.githubusercontent.com/RRZE-PP/grails-cmeditor-demo/master/example.gif)


### Textareas
You can substitute a `<g:textArea name=""/>` with `<cmeditor:textArea name=""/>`.

For further documentation please visit [our project wiki](https://github.com/RRZE-PP/grails-cmeditor/wiki/Tabbed-Editor) for information on the API.

So for example use: `<g:textArea name="foobar" binding="vim" options="[readOnly: true"] />`