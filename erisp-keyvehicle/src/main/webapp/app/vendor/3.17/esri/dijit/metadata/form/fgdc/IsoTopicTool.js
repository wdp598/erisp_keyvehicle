// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/3.17/esri/copyright.txt for details.
//>>built
define("esri/dijit/metadata/form/fgdc/IsoTopicTool","dojo/_base/declare dojo/_base/lang dojo/_base/array dojo/query dojo/has dijit/registry ../tools/ClickableTool ./IsoTopicDialog ../../../../kernel".split(" "),function(c,f,p,g,h,k,l,m,n){c=c([l],{thesaurus:"http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode",postCreate:function(){this.inherited(arguments)},whenToolClicked:function(c,d){if(d&&d.parentXNode){var a,b,e=null;a=null;if(b=d.parentXNode.getParentElement())if((b=
g("[data-gxe-path\x3d'/metadata/idinfo/keywords/theme/themekey']",b.domNode))&&1===b.length)if(b=k.byNode(b[0]))e=b.inputWidget,a=e.getInputValue(),null!==a&&!a.push&&(a=[a]);e&&(a=new m({values:a,onChange:f.hitch(this,function(a){d.setInputValue(this.thesaurus);e.importValues(null,a)})}),a.show())}}});h("extend-esri")&&f.setObject("dijit.metadata.form.fgdc.IsoTopicTool",c,n);return c});