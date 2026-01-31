import React from 'react';

const UserAvatar = ({ name, image, size = 40 }) => {
    // Generate deterministic color based on name
    const stringToColor = (str) => {
        if (!str) return '#ccc';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    };

    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const bgColor = stringToColor(name);

    if (image) {
        return (
            <img
                src={image}
                alt={name}
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
            />
        );
    }

    return (
        <div
            className="d-flex align-items-center justify-content-center text-white fw-bold"
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: bgColor,
                fontSize: size * 0.4,
                border: '2px solid #fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
        >
            {initial}
        </div>
    );
};

export default UserAvatar;
