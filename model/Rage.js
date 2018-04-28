/**
 *
 * @type {module.Rage}
 */
module.exports = class Rage {
  /**
   *
   * @param {array} arrayPerson
   * @param {number} min
   * @param {number} max
   * @param {string} base
   */
  constructor(arrayPerson, min, max, base) {
    this.persons = arrayPerson;
    this.minRage = min;
    this.maxRage = max;
    this.baseRoute = base;
  }

  /**
   *
   * @param {number} personId
   * @return {T | undefined}
   */
  findPersonById(personId) {
    return this.persons.find((person) => {
      return person.id === personId;
    });
  }

  /**
   *
   * @param {number} personId
   * @return {number}
   */
  findPersonIndexById(personId) {
    return this.persons.findIndex((person) => {
      return person.id === personId;
    });
  }
};
