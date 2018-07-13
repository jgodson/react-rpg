import React from 'react';
import PropTypes from 'prop-types';
import { SkillCard, EventListener } from '../../ui';
import './SkillList.css';

export default class SkillList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.actions = props.isTraining
      ?
        [
          { name: 'Learn', primary: true, onClick: (index) => () => props.onSkillAction(index) }
        ]
      : 
        null

    this.state = {
      selected: null,
      actions: null,
    };
  }

  selectSkill = (evt) => {
    const cardElement = evt.target.className === "MagicCard" ? evt.target : evt.target.parentElement;
    const elementIndex = parseInt(cardElement.getAttribute('data-index'), 10);
    if (isNaN(elementIndex)) { return; }

    this.setState({
      selected: elementIndex,
      actions: this.actions,
    });
    this.props.onSelectSkill && this.props.onSelectSkill(elementIndex);
  }

  render() {
    const { skills, hero, disableFn, isTraining, gold } = this.props;

    return(
      <div className="SkillList">
        <EventListener events={[{ name: 'click', handler: this.selectSkill }]}>
          {skills.map((skill, index) => {
            return (
              <SkillCard
                key={`${skill.name}`}
                skill={skill}
                hero={hero}
                gold={gold}
                showPrice={isTraining}
                disabled={hero.skills.find((skill) => skill.id) || (disableFn && disableFn(skill))}
                index={index}
                actions={this.state.selected === index ? this.state.actions : null}
              />
            );
          })}
        </EventListener>
      </div>
    );
  }
}

SkillList.propTypes = {
  skills: PropTypes.arrayOf(PropTypes.object).isRequired,
  hero: PropTypes.object.isRequired,
  gold: PropTypes.number.isRequired,
  disableFn: PropTypes.func,
  onSelectSkill: PropTypes.func,
  onSkillAction: PropTypes.func,
  isTraining: PropTypes.bool,
};