// Split Line

function splitLine(line, width){
  // Basecases
  if (line.length === 0) return [[], []]; // length of line is zero
  if (width === 0) return [[], line]; // document width is zero
  let [head, ...rest] = line; // destructure line by removing first element
  // Recursive case
  if(head.length <= width){
    // if width greater than first word length
    // Reccursively call for remaining line with decreased width
    let sub_answer = splitLine(rest, width - (head.length + 1))
    // Return by adding the first word into the recursive result
    return [[head, ...sub_answer[0]],[...sub_answer[1]]];
  }
  else{
    // Also Basecase
    return [[], line];
  }
}

// Line Breaks

// dictionary
enHyp = {
  "creative" : ["cr","ea","ti","ve"],
  "controls" : ["co","nt","ro","ls"],
  "achieve" : ["ach","ie","ve"],
  "future" : ["fu","tu","re"],
  "present" : ["pre","se","nt"],
  "motivated" : ["mot","iv","at","ed"],
  "desire" : ["de","si","re"],
  "others" : ["ot","he","rs"],
}

function getPermutations(arr){
  let [fst , snd] = arr; // destructure array
  if(snd.length === 0) return [[fst, snd]]; // basecase

  let [x, ...xs] = snd; // remove one element from right arrray
  let permute = [[...fst, x], xs]; // shift removed element to left array
  let answer = getPermutations(permute); // call for further combinations
  return [arr, ...answer]; // return all combinations
}

function lineBreaks(dict, width, line){
  let [fstPart, sndPart] = splitLine(line, width);
  if(sndPart.length === 0) return [[fstPart, sndPart]];

  let word = sndPart[0].replace(/[^A-Za-z]/g,''); // get first word of second part of line
  if(dict.hasOwnProperty(word)){
    let permutations = getPermutations([[],dict[word]]);
    // map all permutations with splitLine output
    let possAns = permutations.map(x => {
      // see if hyphen needed
      let leftSide = x[0].length ? x[0].join('').concat('-') : [];
      // see if punctuation mark needed
      let rightSide = sndPart[0].match(/[.,]/) ?
            x[1].join('') + sndPart[0].substr(-1):
            x[1].join('') ;
      // add leftSide and rightSide
      return leftSide.length?
        [[ ...fstPart, leftSide],[ rightSide, ...sndPart.slice(1)]]
        : [[ ...fstPart],[ rightSide, ...sndPart.slice(1)]];
    });
    // filter lines with greater than the width length
    let finAns = possAns.filter(x => {
      let total = x[0].reduce((prev, curr) => curr.length + prev, 0);
      return (x[0].length - 1 + total) <= width
    })
    return finAns; // return final answer
  }
  else{
    return [[fstPart, sndPart]];
  }
}

// Blank Insertions

function singleBlankInsert(line){
  // when only two words basecase
  if(line.length === 2) return [[line[0],' ',line[1]]];
  // when only one word basecase
  if(line.length <= 1) return [line];
  let [head, ...tail] = line;
  let answer = singleBlankInsert(tail);
  answer = answer.map(x => [head, ...x]);
  answer.push([head, ' ', ...tail]);
  return answer;
}

function blankInsertions(num, line){
  if(num === 0) return [line];
  if(line.length <= 1) return [line];
  let answer = blankInsertions(num-1, line);
  // insert one blank for each line using map
  answer = answer.map(x => singleBlankInsert(x));
  // flatten the array
  answer = answer.reduce((prev, curr)=> prev.concat(curr), []);
  // filter duplicates
  return Array.from(new Set(answer.map(JSON.stringify)), JSON.parse)
}

// Line Cost

const blankCost = 1.0
const blankProxCost = 1.0
const blankUnevenCost = 1.0
const hypCost = 1.0

function blankPlacements(line, position){
  if(line.length === 0) return [position];
  let [head, ...rest] = line;
  if(head === ' '){
    return [position, ...blankPlacements(rest, 0)];
  }
  else{
    return blankPlacements(rest, position +1);
  }
}

function lineCost(line){
  // get blank positions
  let blankPositions = blankPlacements(line, 0);
  // get sum of blank positions
  let sum = blankPositions.reduce((prev,acc)=> prev + acc ,0);
  // get average of the positions
  let average = sum / blankPositions.length
  // calculate variance below
  let sumOfSquaredDiff = blankPositions
    .map(x => (x - average)**2) // squared differences from the mean
    .reduce((prev,curr) => prev + curr, 0) // sum of differences
  let variance = sumOfSquaredDiff / blankPositions.length;

  // count hyphens
  let hyphenCount = line
    .map(x => x.match(/[-]/g) ? 1 : 0) // check for hyphens
    .reduce((prev,acc)=> prev + acc ,0); // count hyphens

  // count additional blanks
  let numberOfBlanks = line
    .map(x => x === ' ' ? 1 : 0) // check for blanks
    .reduce((prev,acc)=> prev + acc ,0); // count blanks

  let totalCost = blankCost * numberOfBlanks
    + blankProxCost * (line.length - average)
    + blankUnevenCost * variance
    + hypCost * hyphenCount;

  return totalCost;
}

// Best Line Break

function lineLength(line){
  if(line.length === 0) return 0;
  if(line.length === 1) return line[0].length;
  if(line[0] === ' '){
    return 1 + lineLength(line.slice(1));
  }
  else{
    return 1 + line[0].length + lineLength(line.slice(1));
  }
}

function bestLineBreak(lineCostFunc, dict, width, line){
  // split into possible lines
  let possibleLines = lineBreaks(dict, width, line);
  // add spaces
  possibleLines = possibleLines
    .map(x => {
      // add blanks
      let insertedBlanks = blankInsertions(width - lineLength(x[0]), x[0])
        .map(y => [y, x[1]])
      return insertedBlanks;
    })
    .reduce((prev, curr)=> prev.concat(curr), []); // flatten the array
  // filter maximum length lines:
  let maxLength = possibleLines.reduce((max, curr)=>{
    return max > lineLength(curr[0]) ? max : lineLength(curr[0]);
  },lineLength(possibleLines[0][0]))
  // filter all lines of maxLength
  possibleLines = possibleLines.filter(x => lineLength(x[0]) === maxLength);

  let minimumCostLine = possibleLines.reduce((min, curr)=>{
    return lineCostFunc(min[0]) > lineCostFunc(curr[0]) ? curr : min;
  }, possibleLines[0]);

  return minimumCostLine;
}

// Justify Text

function justifyTextRecur(lineCostFunc, dict, width, text){
  let [fst, snd] = bestLineBreak(lineCostFunc,dict, width, text);
  if(snd.length === 0){
    return [text]
  }
  return [fst, ...justifyTextRecur(lineCostFunc,dict,width,snd)];
}

function justifyText(lineCostFunc, dict, width, text){
  return justifyTextRecur(lineCostFunc,dict,width, text.split(' '));
}
