import React from 'react';

const Rank = ({name, entries}) => {
	return (
		<div>
			<div className='white f3'>
				{`${name} , you did this amount of entries : `}
			</div>
			<div className='white f1'>
				{entries}
			</div>
		</div>
		);
}

export default Rank;