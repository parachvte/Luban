import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import Select from '../../../components/Select';
import i18n from '../../../../lib/i18n';
import Anchor from '../../../components/Anchor';
import styles from '../styles.styl';
import { actions as cncActions } from '../../../../flux/cnc';
import CncToolManager from '../../CncToolManager';

function ToolSelector(props) {
    const [showManager, setShowManager] = useState(false);
    const dispatch = useDispatch();
    const { toolDefinitions, toolDefinition, isModifiedDefinition } = props;

    const toolDefinitionOptions = [];
    const toolDefinitionOptionsObj = {};

    function onShowCncToolManager() {
        setShowManager(true);
    }

    function renderModalView() {
        function onclose() {
            setShowManager(false);
        }
        return (
            showManager && (<CncToolManager closeToolManager={onclose} />)
        );
    }

    async function onChangeActiveToolListValue(option) {
        if (option.definitionId === 'new') {
            await onShowCncToolManager();
            props.setCurrentValueAsProfile();
        } else {
            const definitionId = option.definitionId;
            const name = option.name;
            await dispatch(cncActions.changeActiveToolListDefinition(definitionId, name));
        }
    }

    toolDefinitions.forEach(tool => {
        const category = tool.category;
        const definitionId = tool.definitionId;

        if (Object.keys(tool?.settings).length > 0) {
            const checkboxAndSelectGroup = {};
            const name = tool.name;
            let detailName = '';
            if (tool.settings.angle.default_value !== '180') {
                detailName = `${tool.name} (${tool.settings.angle.default_value}${tool.settings.angle.unit} ${tool.settings.shaft_diameter.default_value}${tool.settings.shaft_diameter.unit} )`;
            } else {
                detailName = `${tool.name} (${tool.settings.shaft_diameter.default_value}${tool.settings.shaft_diameter.unit} )`;
            }
            checkboxAndSelectGroup.name = name;
            checkboxAndSelectGroup.definitionId = definitionId;
            checkboxAndSelectGroup.label = `${detailName}`;
            checkboxAndSelectGroup.value = `${definitionId}-${name}`;
            if (toolDefinitionOptionsObj[category]) {
                toolDefinitionOptionsObj[category].options.push(checkboxAndSelectGroup);
            } else {
                const groupOptions = {
                    label: category,
                    definitionId: definitionId,
                    options: []
                };
                toolDefinitionOptionsObj[category] = groupOptions;
                groupOptions.options.push(checkboxAndSelectGroup);
            }
        }
        // return true;
    });
    Object.values(toolDefinitionOptionsObj).forEach((item) => {
        toolDefinitionOptions.push(item);
    });

    const valueObj = {
        firstKey: 'definitionId',
        firstValue: toolDefinition.definitionId
    };

    if (isModifiedDefinition) {
        toolDefinitionOptions.push({
            name: 'modified',
            definitionId: 'new',
            label: 'Create profile with current parameters',
            value: 'new-modified'
        });
    }
    const foundDefinition = toolDefinitionOptions.find(d => d.label === toolDefinition.category);

    return (
        <div>
            <React.Fragment>
                <div className="sm-parameter-container">
                    <div
                        className={classNames(
                            styles['manager-wrapper']
                        )}
                    >
                        <span className={classNames(
                            'sm-parameter-row__label',
                            styles['manager-select-name'],
                        )}
                        >
                            {i18n._('Tool')}
                        </span>
                        {(isModifiedDefinition
                            && (
                                <span
                                    className={classNames(
                                        styles['manager-is-modified']
                                    )}
                                />
                            )
                        )}
                        <Select
                            className={classNames(
                                styles['manager-select'],
                                'sm-parameter-row__select'
                            )}
                            clearable={false}
                            isGroup
                            valueObj={valueObj}
                            options={toolDefinitionOptions}
                            placeholder={i18n._('Choose profile')}
                            onChange={onChangeActiveToolListValue}
                        />
                        <p className={classNames(
                            styles['manager-detail'],
                        )}
                        >
                            {foundDefinition && `${i18n._('Material')} : ${foundDefinition.label}`}
                        </p>
                        <Anchor
                            onClick={onShowCncToolManager}
                        >
                            <span
                                className={classNames(
                                    styles['manager-icon'],
                                )}
                            />
                        </Anchor>
                    </div>
                </div>
                {renderModalView()}
            </React.Fragment>
        </div>
    );
}
ToolSelector.propTypes = {
    toolDefinitions: PropTypes.array.isRequired,
    toolDefinition: PropTypes.object.isRequired,
    isModifiedDefinition: PropTypes.bool.isRequired,
    setCurrentValueAsProfile: PropTypes.func.isRequired
};

export default ToolSelector;
