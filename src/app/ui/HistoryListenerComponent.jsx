// import React, { PureComponent, useRef } from 'react';
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
// import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { actions as projectActions } from '../flux/project';
import { HEAD_3DP, HEAD_CNC, HEAD_LASER } from '../constants';


function getCurrentHeadType(pathname) {
    if (!pathname) {
        return null;
    }
    let headType = null;
    if (pathname.indexOf(HEAD_CNC) >= 0) headType = HEAD_CNC;
    if (pathname.indexOf(HEAD_LASER) >= 0) headType = HEAD_LASER;
    if (pathname.indexOf(HEAD_3DP) >= 0) headType = HEAD_3DP;
    return headType;
}

const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => { ref.current = value; });

    return ref.current;
};

const useLocationChange = (action) => {
    const location = useLocation();
    const prevLocation = usePrevious(location);
    useEffect(() => {
        action(location, prevLocation);
    }, [location]);
};

const HistoryListenerComponent = () => {
    const dispatch = useDispatch();
    useLocationChange(async (location, prevLocation) => {
        const headType = getCurrentHeadType(prevLocation?.pathname);
        if (!headType) {
            return;
        }
        await dispatch(projectActions.save(headType));
        console.log('changed from', prevLocation, 'to', location);
    });
    return (
        <div />
    );
};
export default HistoryListenerComponent;

// class HistoryListenerComponent extends PureComponent {
//   static propTypes = {
//       ...withRouter.propTypes,
//       save: PropTypes.func.isRequired
//   }
//
//   componentWillMount() {
//       this.unlisten = this.props.history.listen(async (location, action) => {
//           console.log('on route change', useRef, location, action);
//           const headType = getCurrentHeadType(location.pathname);
//           console.log('on route save', headType, location,);
//           if (!headType) {
//               return;
//           }
//           await this.props.save(headType);
//       });
//   }
//
//   componentWillUnmount() {
//       this.unlisten();
//   }
//
//   render() {
//       return (
//           <div>{this.props.children}</div>
//       );
//   }
// }
//
// const mapDispatchToProps = (dispatch) => {
//     return {
//         save: (headType, dialogOptions) => dispatch(projectActions.save(headType, dialogOptions))
//     };
// };
// export default connect(null, mapDispatchToProps)(withRouter(HistoryListenerComponent));
