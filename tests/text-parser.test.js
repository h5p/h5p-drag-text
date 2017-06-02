import test from 'ava';

//H5P.DragTextTextParser = (function(){

var TextParser = function() {
  this.nextDraggableRegex = /\*(.*?)\*/;
};


TextParser.prototype.parse = function (text) {
 var next = this.findNextDraggable(text);

 if(next) {
   var parts = text.split(next);
   return [parts[0], next].concat(this.parse(parts[1]))
 }
 else {
   return [text];
 }
};

/**
* Finds the next draggable in a string
*
* @param {string} text
* @return {string|null}
*/
TextParser.prototype.findNextDraggable = function(text) {
 var draggable = this.nextDraggableRegex.exec(text);
 return draggable ? draggable[0] : null;
};

test('Test should pass', t => {
  // /\*(.*?)\*/
    //const text = 'hello/all';
    //const text = 'hello/\all'; //'hello/all'
    //const text = 'hello/\*all'; //[ 'hello/*all' ]
    //const text = 'hello/\*(all'; //[ 'hello/*(all' ]
   //const text = 'hello/\*(.all'; //[ 'hello/*(.all' ]
    //const text = 'hello/\*(.?all'; //[ 'hello/*(.?all' ]
    //const text = 'hello/\*(.?)all'; crash
    //const text = 'hello/\*(.?\all'; crash
    //const text = 'hello/\*(.?/all'; [ 'hello/*(.?/all' ]
    //const text = '/\*(.?/'; [ '/*(.?/' ]
    //const text = '/\*(.)?/'; [ '/*(.)?/' ]
    //const text = ' hello '; [ ' hello ' ]
    //const text = '  '; [ '  ' ]
    //const text = ' /\*(.)?/ '; [ ' /*(.)?/ ' ]
   // const text = ' / \ *(.)?/ '; //[ ' /  *(.)?/ ' ]
   //const text = ' / \ * ( . ) ? / '; //[ ' /  * ( . ) ? / ' ]
    //const text = '  /  \  *  (  .  )  ?  /  '; [ '  /    *  (  .  )  ?  /  ' ]
    //const text = '/\*(.)?/ hello to the world';[ '/*(.)?/ hello to the world' ]
    //const text = 'hello to the world /\*(.)?/ ';[ 'hello to the world /*(.)?/ ' ]

    const text = 'hello/all';
    const parser = new TextParser();
    let result = [];
    result = parser.parse(text);
    t.is(result[0], 'hello/all');
    t.pass();
    console.log(result);
});
