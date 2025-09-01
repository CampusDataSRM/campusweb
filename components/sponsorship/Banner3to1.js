import React from 'react';
import PropTypes from 'prop-types';

const Banner3to1 = ({ imageUrl, linkUrl, altText }) => {
    const handleClick = () => {
        window.open(linkUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div style={{ 
            width: '100%', 
            position: 'relative', 
            paddingBottom: '33.33%', 
            backgroundColor: 'black',
            borderRadius: '12px',
            overflow: 'hidden'
        }}>
            <img
                src={imageUrl}
                alt={altText}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    cursor: 'pointer',
                }}
                onClick={handleClick}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '3px',
                    left: '3px',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                     padding: '2px 6px', 
                    borderRadius: '8px', 
                    fontSize: '10px', 
                    fontWeight: '500',
                    backdropFilter: 'blur(1px)',
                    WebkitBackdropFilter: 'blur(2px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    pointerEvents: 'none'
                }}
            >
               Our Sponsor
            </div>
        </div>
    );
};

Banner3to1.propTypes = {
    imageUrl: PropTypes.string.isRequired,
    linkUrl: PropTypes.string.isRequired,
    altText: PropTypes.string,
};

Banner3to1.defaultProps = {
    altText: 'Banner Image',
};

export default Banner3to1;