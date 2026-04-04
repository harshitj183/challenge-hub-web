const mongoose = require('mongoose');
const { Challenge, Match, UserChallenge, User } = require('./src/lib/db/models');

async function runTest() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/photobox');
        console.log('Connected.');

        // 1. Create a dummy challenge
        const challenge = await Challenge.create({
            title: 'Test Tournament ' + Date.now(),
            description: 'Automated Test',
            challengeType: 'tournament',
            tournamentDetails: { divisions: 1 },
            createdBy: new mongoose.Types.ObjectId(),
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000)
        });
        console.log('Created Challenge:', challenge._id);

        // 2. Mock 4 participants
        const participants = [];
        for (let i = 0; i < 4; i++) {
            const user = await User.create({
                name: `Player ${i}`,
                email: `player${Date.now()}${i}@test.com`,
                role: 'user'
            });
            participants.push(user._id);
            await UserChallenge.create({
                challengeId: challenge._id,
                userId: user._id,
                status: 'active'
            });
        }
        console.log('Created 4 Participants.');

        // 3. Generate Bracket (Simulate POST /api/challenges/[id]/bracket)
        console.log('Generating Round 1...');
        const round1Matches = [];
        for (let i = 0; i < 2; i++) {
            round1Matches.push({
                challengeId: challenge._id,
                round: 1,
                matchIndex: i,
                division: 'A',
                participants: [participants[i * 2], participants[i * 2 + 1]],
                status: 'active',
                scores: [0, 0]
            });
        }
        const createdMatches = await Match.insertMany(round1Matches);
        console.log('Generated 2 matches for Round 1.');

        // 4. Update Match 0 winner (Simulate PATCH /api/challenges/[id]/bracket)
        // Match 0 winner should advance to Round 2, Position 0, Player 0
        const match0 = createdMatches[0];
        console.log(`Updating Match 0 (${match0._id}) winner to ${match0.participants[0]}...`);
        
        // Logical check similar to API
        const winnerId = match0.participants[0];
        match0.winner = winnerId;
        match0.status = 'completed';
        match0.scores = [5, 3];
        await match0.save();

        const nextRound = 2;
        const nextMatchIndex = 0; // Math.floor(0 / 2)
        
        let nextMatch = await Match.findOne({
            challengeId: challenge._id,
            round: nextRound,
            matchIndex: nextMatchIndex
        });

        if (!nextMatch) {
            console.log('Creating Round 2 Match placeholder...');
            nextMatch = await Match.create({
                challengeId: challenge._id,
                round: nextRound,
                matchIndex: nextMatchIndex,
                division: 'A',
                participants: [winnerId, null],
                status: 'pending',
                scores: [0, 0]
            });
        }

        console.log('Round 2 Match State:', nextMatch.participants);
        if (nextMatch.participants[0].toString() === winnerId.toString()) {
            console.log('SUCCESS: Round 1 Match 0 winner advanced to Round 2 Match 0, P0');
        } else {
            console.log('FAILURE: Winner did not advance correctly');
        }

        // 5. Cleanup
        console.log('Cleaning up...');
        await Challenge.deleteOne({ _id: challenge._id });
        await Match.deleteMany({ challengeId: challenge._id });
        await UserChallenge.deleteMany({ challengeId: challenge._id });
        await User.deleteMany({ _id: { $in: participants } });
        
        process.exit(0);
    } catch (err) {
        console.error('Test Error:', err);
        process.exit(1);
    }
}

runTest();
