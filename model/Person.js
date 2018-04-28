/**
 *
 * @type {module.Person}
 */
module.exports = class Person {
  /**
   *
   * @param {string} name
   * @param {number} nbVoteLimit
   */
  constructor(name, nbVoteLimit) {
    this.id = Math.random().toString(32);
    this.name = name;
    this.rageLevel = 0;
    this.nbVote = 0;
    this.nbVoteLimit = nbVoteLimit;
  }

  /**
   *
   * @return {number}
   */
  get vote() {
    return this.nbVote;
  }

  /**
   *
   * @return {number}
   */
  get getRageLevel() {
    return this.rageLevel;
  }

  /**
   *
   * @return {{}}
   */
  addVote() {
    const newVote = this.nbVote + 1;
    const obj = {};
    if (newVote <= this.nbVoteLimit) {
      this.nbVote++;
      obj.vote = true;
    } else {
      obj.vote = false;
    }

    return obj;
  }
};
