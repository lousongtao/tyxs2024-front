
// Validates that the input string is a valid date formatted as "yyyy-MM/-d"
export function checkDateFormat(dateString: string){
  // First check for the pattern
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dateString))
    return false;
  // Parse the date parts to integers
  const parts = dateString.split("-");
  const day = parseInt(parts[2], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[0], 10);

  // Check the ranges of month and year
  if(year < 1000 || year > 3000 || month === 0 || month > 12)
    return false;
  const monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

  // Adjust for leap years
  if(year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0))
    monthLength[1] = 29;

  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
}

//把日期格式调整为yyyy-MM-dd
export function formatDate1(dateString: string){
  //如果格式非法, 直接输出, 不做调整
  if(!/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateString))
    return dateString;
  const parts = dateString.split("-");
  const day = parseInt(parts[2], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[0], 10);
  var output = year;
  if (parts[1].length == 1) output += '-0' + parts[1];
  else output += '-' + parts[1];
  if (parts[2].length == 1) output += '-0' + parts[2];
  else output += '-' + parts[2];
  return output;
}
