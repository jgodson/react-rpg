import React from 'react';
import PropTypes from 'prop-types';
import { SkillCard, EventListener } from '../../ui';
import './SkillList.css';

export default class SkillList extends React.PureComponent {
  state = {
    selected: null,
    actions: null,
  };

  selectSkill = (evt) => {
    const cardElement = evt.target.className === "SkillCard" ? evt.target : evt.target.parentElement;
    const elementIndex = parseInt(cardElement.getAttribute('data-index'), 10);
    if (isNaN(elementIndex)) { return; }
    const isDisabled = cardElement.classList.contains('disabled');
    if (isDisabled) { return; }

    const selected = this.props.skills[elementIndex];
    const type = cardElement.classList.contains('skills') ? 'skills' : 'magic';
    const heroHasSkill = this.props.hero[type].findIndex((skill) => skill.id === selected.id) > -1;
    const actions = this.props.isTraining
    ?
      [
        { name: 'Details', disabled: true, primary: true },
        { 
          name: heroHasSkill ? 'Upgrade' : 'Learn',
          primary: true,
          onClick: this.onSkillAction
        }
      ]
    : 
      null

    this.setState({
      selected: elementIndex,
      actions,
    });
    const skill = this.props.skills[elementIndex];
    if (this.props.onSelectSkill) {
      this.props.onSelectSkill(skill);
    }
  }

  onSkillAction = (index) => () => {
    const skill = this.props.skills[index];
    this.props.onSkillAction(skill);
    this.setState({selected: null, actions: null});
  }

  render() {
    const { skills, hero, disableFn, isTraining, gold } = this.props;

    return(
      <div className="SkillList">
        <EventListener events={[{ name: 'click', handler: this.selectSkill }]}>
          {skills.length > 0
          ? 
            skills.map((skill, index) => {
              return (
                <SkillCard
                  key={`${skill.name}`}
                  skill={skill}
                  hero={hero}
                  gold={gold}
                  isTraining={isTraining}
                  disabled={disableFn && disableFn(skill)}
                  index={index}
                  actions={this.state.selected === index ? this.state.actions : null}
                />
              );
            })
          :
            <p>None yet! Learn some at the Training Grounds in town</p>
        }
        </EventListener>
      </div>
    );
  }
}

SkillList.propTypes = {
  skills: PropTypes.arrayOf(PropTypes.object).isRequired,
  hero: PropTypes.object.isRequired,
  gold: PropTypes.number,
  disableFn: PropTypes.func,
  onSelectSkill: PropTypes.func,
  onSkillAction: PropTypes.func,
  isTraining: PropTypes.bool,
};