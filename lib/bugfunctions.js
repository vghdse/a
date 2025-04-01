module.exports = {
    getMentionedOrQuoted: (m) => {
        if (m.quoted?.sender) return m.quoted.sender;
        if (m.mentions && m.mentions.length > 0) return m.mentions[0];
        return null;
    }
};
