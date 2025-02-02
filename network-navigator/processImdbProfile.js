import { createEdge, createNode, findNodeByProperty } from './utils.js';

export const processImdbProfile = (cy, message) => {
    const contentDiv = document.getElementById('content');
    contentDiv.textContent = `
          Profile Type: ${JSON.stringify(message.profile.type)} \n
          Profile: ${JSON.stringify(message.profile)}
          IMDB URL: ${message.imdbUrl}
        `;


    const profile = message.profile;



    if (profile.type === 'title') {
        let titleNode = findNodeByProperty(cy, 'label', profile.name);
        if (!titleNode) {
            titleNode = createNode(cy, profile.name);
            titleNode.data('url', message.imdbUrl);
            titleNode.data('type', profile.type);
            titleNode.data('rating', profile.rating.split('/')[0]);
            titleNode.data('subtype', `imdb${profile.subtype}`);
            titleNode.data('shape', 'square');

        }
        if (profile.image) titleNode.data('image', profile.image);
        if (profile.plot) titleNode.data('plot', profile.plot);
        if (profile.period) titleNode.data('period', profile.period);
        if (profile.chips) titleNode.data('tags', profile.chips);

        if (profile.cast) {
            profile.cast.forEach(actor => {
                let actorNode = findNodeByProperty(cy, 'label', actor.name);
                if (!actorNode) {
                    actorNode = createNode(cy, actor.name);
                    actorNode.data('url', actor.actorUrl);
                    actorNode.data('type', 'person');
                    actorNode.data('subtype', `actor`);
                    actorNode.data('shape', 'star');
                }
                if (actor.image) actorNode.data('image', actor.image);
                const edge = createEdge(cy, actorNode, titleNode);
                edge.data('label', 'acted in');
                edge.data('type', 'actedIn');
                edge.data('role', actor.characterName);
                edge.data('details', actor.details);
            });
        }
        // personNode.data('about', profile.about);
        // if (profile.location) personNode.data('location', profile.location);

    }
/*
        if (profile.currentCompany) {
            personNode.data('currentCompany', profile.currentCompany);
            let companyNode = findNodeByProperty(cy, 'label', profile.currentCompany);
            if (!companyNode) {
                companyNode = createNode(cy, profile.currentCompany);
                companyNode.data('image', profile.currentCompanyLogo);
                //companyNode.data('url', profile.companyUrl);
                companyNode.data('type', 'company');
                companyNode.data('shape', 'square');
            }
            const edge = createEdge(cy, personNode, companyNode);
            edge.data('label', 'works at');
            edge.data('type', 'workAt');
            edge.data('role', profile.currentRole);
        }
        if (profile.latestEducation) {
            let educationNode = findNodeByProperty(cy, 'label', profile.latestEducation);
            if (!educationNode) {
                educationNode = createNode(cy, profile.latestEducation);
                educationNode.data('image', profile.latestEducationLogo);
                educationNode.data('type', 'education');
                educationNode.data('shape', 'diamond');
            }
            const edge = createEdge(cy, personNode, educationNode);
            edge.data('label', 'educated at');
            edge.data('type', 'educatedAt');
        }

        // handle experience
        if (profile.experience) {
            // loop over elements in array experience
            for (let i = 0; i < profile.experience.length; i++) {
                const experience = profile.experience[i];
                let companyNode = findNodeByProperty(cy, 'label', experience.company);

                if (!companyNode) {
                    companyNode = createNode(cy, experience.company);
                    companyNode.data('image', experience.companyImageUrl);
                    companyNode.data('url', experience.companyUrl);
                    companyNode.data('type', 'company');
                    companyNode.data('shape', 'square');
                }
                companyNode.data('linkedInUrl', experience.companyUrl);
                const edge = createEdge(cy, personNode, companyNode);
                edge.data('label', 'works at');
                edge.data('type', 'workAt');
                edge.data('role', experience.role);
                edge.data('location', experience.location);
                edge.data('period', experience.period);

                const parts = experience.period.split('-')
                const startDate = new Date(`${parts[0]} 1`);
                edge.data('startDate', startDate);
                if (parts[1] === "Present") {
                    edge.data('endDate', new Date());
                    edge.data('present', true);
                } else {
                    const endDate = new Date(`${parts[1]} 1`);
                    edge.data('endDate', endDate);
                }



                edge.data('about', experience.about);
                edge.data('involvement', experience.involvement);

            }
        }


    }
*/
    }
