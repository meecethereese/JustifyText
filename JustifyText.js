// Split Line

function splitLine(line, width)
{
  var arr = new Array();
  var ind = 0;

  arr.push([]);

  line.forEach(val =>
  {
    if (val.length <= width)
    {
      arr[0].push(val);
      ind++;
    }

    width -= (val.length + 1);
  })

  arr.push(line.slice(ind, line.length));

  return arr;
}

// Iterative Solution:
// var arr = new Array();
// var str = line.join(' ');
// var j = 0;

// arr.push([]);

// for (var i = 0; i < width && i < str.length; i++)
// {
//   if (str[i] === line[j][line[j].length-1])
//   {
//     arr[0].push(line[j++]);
//   }
// }

// if (j === line.length)
//   arr.push([]);

// else
//   arr.push(line.slice(j, line.length));

// return arr;

// Line Breaks

function getPermutations(arr)
{
  var perms = new Array();
  var str = "";

  arr.forEach(val =>
  {
    if (str.length > 1)
      str = str.slice(0, -1);

    str += (val + '-');
    perms.push(str)
  })

  return perms;
}

function lineBreaks(dict, width, line)
{
  var ret = new Array();
  var orig = splitLine(line, width);

  ret.push(orig);

  if (orig[1].length > 0)
  {
    var key = orig[1][0].replace(/[^A-Za-z]/g, "");

    if (key in dict)
    {
      var perms = getPermutations(dict[key]);
      var str = ret[0][0].join(' ');
      var temp = width - str.length - 1;
      var copies = new Array();

      perms.forEach((val, ind) =>
      {
         copies.push([[...orig[0]], [...orig[1]]]);

        if (val.length <= temp)
        {
          copies[ind][0].push(val);
          copies[ind][1][0] = copies[ind][1][0].slice(val.length - 1);

          ret.push(copies[ind]);
        }
      })
    }
  }

  return ret;
}

// Blank Insertions

function singleBlankInsert(line)
{
  line.forEach((_, ind) =>
  {
    if (ind != 0 && ind != line.length - 1)
      line.splice(ind, 0, ' ');
  })

  return line;
}

function blankInsertions(num, line)
{
  if (num === 0)
    return line;

  if (line.length <= 1)



  return null;
}

function singleBlankInsert(line)
{
  var arr = new Array();

  line.forEach((_, ind) =>
  {
    if (ind != 0)
    {
      var copy = [...line];

      copy.splice(ind, 0, ' ');

      arr.push(copy);

      if (ind === line.length - 1)
        arr.push(copy);
    }
  })

  return arr;
}

function blankInsertions(num, line)
{
  // Base Cases
  if (num === 0)
    return [line];

  else if (line.length <= 1)
    return [line];

  // Recursive Case
  else
  {
    var arr = new Array();

    arr = singleBlankInsert(line);

    arr.forEach(val =>
    {
      var temp = blankInsertions(num - 1, val);

      temp.forEach(val => arr.push(val))
    });

    var temp = Array.from(new Set(arr.map(JSON.stringify)), JSON.parse);
    var ans = new Array();

    temp.forEach((val, ind) =>
    {
      if (val.length >= line.length + num)
        ans.push(val);
    });

    return ans;
  }
}

// Line Cost

const blankCost = 1.0
const blankProxCost = 1.0
const blankUnevenCost = 1.0
const hypCost = 1.0

function blankPlacements(line, position)
{
  var arr = new Array();

  // I want to recurse until I get to the start of the line
  if (position === 0)
  {
    return [];
  }

  else
  {
    arr = blankPlacements(line, position - 1);

    if (line[position] === " ")
    {
      if (arr.length > 0)
        arr.push([position, position - arr[arr.length-1][0] - 1]);

      else
        arr.push([position, position]);
    }

    if (position != line.length - 1)
      return arr;
  }

  var spacePos = new Array();

  arr.forEach(val => spacePos.push(val[1]));

  spacePos.push(position - arr[arr.length-1][0]);

  return spacePos;
}

function lineCost(line)
{
  var totalHyphens = 0;
  var regex = /[-]/g;

  line.forEach(val =>
  {
    if (regex.test(val))
      totalHyphens++;
  });

  var totalBlanks;
  var avgDist;
  var varDist;
  var totalCost;

  var str = line.join("");
  var regex = /[ ]/g;

  if (regex.test(str))
  {
    var spacePos = blankPlacements(line, line.length - 1);

    totalBlanks = spacePos.length - 1;

    var sum = spacePos.reduce((accum, curr) =>
    {
      return accum + curr;
    }, 0);

    avgDist = sum / spacePos.length;

    sum = 0;
    spacePos.forEach(val =>
    {
      var diff = val - avgDist;

      sum += (diff * diff);
    });

    varDist = sum / spacePos.length;

    totalCost = (blankCost * totalBlanks)
                + (blankProxCost * (line.length - avgDist))
                + (blankUnevenCost * varDist)
                + (hypCost * totalHyphens);
  }

  else
    totalCost = hypCost * totalHyphens;

  return totalCost;
}

// Best Line Break

function lineLength(line)
{
  var length = 0;

  line.forEach((val, ind) =>
  {
    length += val.length;

    if (ind != 0 && val != " ")
      length++;
  })

  return length;
}

function bestLineBreak(lineCostFunc, dict, width, line)
{
  if (line.length === 0)
    return [[], []];

  var hyphComb = lineBreaks(dict, width, line);

  var bestLine = hyphComb[0];

  hyphComb.forEach(val =>
  {
    if (lineLength(val[0]) > lineLength(bestLine[0]))
      bestLine = val;
  });

  var blankComb = blankInsertions(width - lineLength(bestLine[0]), bestLine[0]);

  bestLine[0] = blankComb[0];

  blankComb.forEach(val =>
  {
    if (lineCostFunc(val) < lineCostFunc(bestLine[0]))
      bestLine[0] = val;
  });

  return bestLine;
}

// Justify Text

function justifyTextRecur(lineCostFunc, dict, width, text)
{
  var arr = new Array();

  if (text.length <= width)
    arr.push(text.split(' '));

  else
  {
    var lineArr = bestLineBreak(lineCostFunc, dict, width, text.split(' '));

    arr.push(lineArr[0]);

    var temp = justifyTextRecur(lineCostFunc, dict, width, lineArr[1].join(' '));

    temp.forEach(val => arr.push(val));
  }

  return arr;
}

function justifyText(lineCostFunc, dict, width, text)
{
  return justifyTextRecur(lineCostFunc, dict, width, text);
}
