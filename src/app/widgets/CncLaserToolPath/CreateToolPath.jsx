import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import PropTypes from 'prop-types';
import { PAGE_PROCESS } from '../../constants';
import { actions as editorActions } from '../../flux/editor';

import i18n from '../../lib/i18n';

const CreateToolPath = (props) => {
    const headTypeState = useSelector(state => state[props.headType]);
    const page = headTypeState?.page;
    const activeToolListDefinition = headTypeState?.activeToolListDefinition;
    const toolPathTypes = headTypeState?.toolPathGroup?.getToolPathTypes();
    const dispatch = useDispatch();
    const createToolPath = () => dispatch(editorActions.createToolPath(props.headType));
    const fastCreateToolPathDispatch = (toolParams) => dispatch(editorActions.fastCreateToolPath(props.headType, toolParams));
    const actions = {
        fastCreateToolPath: () => {
            const toolParams = {};
            toolParams.definitionId = activeToolListDefinition.definitionId;
            toolParams.definitionName = activeToolListDefinition.name;
            toolParams.toolDiameter = activeToolListDefinition.config.diameter.default_value;
            toolParams.toolAngle = activeToolListDefinition.config.angle.default_value;
            toolParams.toolShaftDiameter = activeToolListDefinition.config.shaft_diameter.default_value;
            fastCreateToolPathDispatch(toolParams);
        }
    };
    useEffect(() => {
        props.setTitle(i18n._('Create Toolpath'));
        props.setDisplay(page === PAGE_PROCESS);
    }, []); // << super important array
    useEffect(() => {
        props.setDisplay(page === PAGE_PROCESS);
    }, [page]);
    return (
        <div>
            <div className="clearfix" tyle={{ height: '20px', textAlign: 'center' }}>
                <img
                    src="../../images/cnc-laser/ic_warning_20x20.png"
                    style={{
                        marginTop: '-4px',
                        width: '20px',
                        height: '20px'
                    }}
                    alt="......"
                />
                <div style={{
                    display: 'inline-block',
                    color: '#979899',
                    fontSize: '14px',
                    fontFamily: 'Roboto-Regular, Roboto',
                    height: '19px',
                    lineHeight: '19px',
                    marginLeft: '9px'
                }}
                >
                    {i18n._('Select Object to Create Toolpath')}
                </div>
            </div>
            <button
                type="button"
                className="sm-btn-large sm-btn-default"
                onClick={createToolPath}
                disabled={!(toolPathTypes.length === 1)}
                style={{ display: 'inline-block', width: '40%' }}
            >
                {i18n._('Create Toolpath')}
            </button>
            <button
                type="button"
                className="sm-btn-large sm-btn-default "
                onClick={actions.fastCreateToolPath}
                style={{ display: 'inline-block', float: 'right', width: '40%' }}
            >
                {i18n._('Fast Create')}
            </button>
        </div>
    );
};
CreateToolPath.propTypes = {
    setTitle: PropTypes.func,
    headType: PropTypes.string,
    setDisplay: PropTypes.func
};
export default CreateToolPath;

// export const createToolPathNameByType = (type) => {
//     return `Toolpath - Picture${type}${count++}`;
// };
