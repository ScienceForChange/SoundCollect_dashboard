export default function compareObjectsValues(
    obj1: any,
    obj2: any
  ): { areEqual: boolean; differentKeys: string[] } {
    const differentKeys: string[] = [];
  
    // Collect common keys from both objects
    const commonKeys = Object.keys(obj1).filter(key => obj2.hasOwnProperty(key));
  
    // Iterate over common keys and compare values
    commonKeys.forEach((key) => {
      if (obj1[key] !== obj2[key]) {
        differentKeys.push(key);
      }
    });
  
    // Determine if objects are equal
    const areEqual = differentKeys.length === 0;
  
    return { areEqual, differentKeys };
  }
