Vue.component('section-nav', {
    props: ['sections'],
    methods: {
        linkFor (section) {
            return `#section-${this.$root.slugify(section.name.toLowerCase())}`;
        }
    },
    template: `
        <ul id="awardSectionNav">
            <li class="awardSectionNavLink" ><router-link :to="{ name: 'home'}">Home</router-link></li>
            <li class="awardSectionNavLink" v-for="section in sections"><router-link :to="{ name: 'section', params: { slug: section.slug }}">{{section.name}}</router-link></li>
            <li class="awardSectionNavLink" ><router-link :to="{ name: 'full'}">View All</router-link></li>
        </ul>
    `
});
Vue.component('awards-section', {
    props: ['section'],
    computed: {
        slug () {
            return `section-${this.$root.slugify(this.section.name)}`;
        }
    },
    template: `
        <div :id="slug" class="awardSectionContainer">
            <div class="awardSectionHeader">
                <div class="sectionIconContainer"><img class="sectionIcon" :alt="section.name" :src="section.icon" /></div>
                <h1 class="sectionHeader">{{section.name}} Awards</h1>
                <div
                    v-if="typeof section.blurb === 'string'"
                    class="awardSectionBlurb"
                    v-html="this.$root.getMarkDown(section.blurb)"
                />
                <div
                    v-else
                    v-for="blurb in section.blurb"
                    class="awardSectionBlurb"
                    v-html="this.$root.getMarkDown(blurb)"
                />
            </div>
            <awards-category
                v-for="award in section.awards"
                :key="award.name"
                :award="award"
            />
        </div>
    `
});
Vue.component('awards-category', {
    props: ['award'],
    computed: {
        slug () {
            return `category-${this.$root.slugify(this.award.name)}`;
        },
        nomPublicOrder() {
            return this.award.nominees.sort((a,b) => { return a.public - b.public;});
        },
        nomJuryOrder() {
            return this.award.nominees.sort((a,b) => { return a.jury - b.jury;});
        }
    },
    methods: {
        toggleRankingSort(event){
            let parentContainer = event.target.parentElement.parentElement.parentElement.parentElement;
            let toggleChecked = event.target.checked;
            let cardContainer = parentContainer.querySelector(".categoryNominationCards");
            let cards = cardContainer.querySelectorAll(".categoryNominationItem");
            let prevLeft = [];

            for (let i = 0; i < cards.length; i++){
                prevLeft[i] = cards[i].offsetLeft;
            }
            for (let card of cards){
                if (toggleChecked) {
                    card.style.order = card.style.webkitOrder = card.getAttribute("data-public");
                } else {
                    card.style.order = card.style.webkitOrder = card.getAttribute("data-jury");
                }
            }
            for (let i = 0; i < cards.length; i++){
                let diffx = prevLeft[i] - cards[i].offsetLeft;
                if (typeof cards[i]._gsTransform !== 'undefined'){
                    diffx += cards[i]._gsTransform.x;
                }
                TweenLite.fromTo(cards[i], .5, {x: diffx}, {x: 0, ease: Power2.easeInOut});
            }
        },
        showCatInfo(){
            this.$root.showCatModal(this.award);
        }
    },
    template: `
        <div :id="slug" class="awardDisplay">
            <h2 class="categoryHeader" @click="showCatInfo">{{award.name}}</h2>
                <award-winners
                    :public="nomPublicOrder[0]"
                    :jury="nomJuryOrder[0]"
                />
                <award-winners-label
                    :public="nomPublicOrder[0]"
                    :jury="nomJuryOrder[0]"
                />
                <div class="categoryNominationContainer">
                    <div class="categoryNominationHeader">
                        <h3 class="categoryNominationTitle">
                            Nominees
                        </h3>
                        <div class="categorySwitchContainer">
                            <span class="categorySwitchLabel">
                                <span class="modalRankingJuryIcon"></span>
                            </span>
                            <label class="categorySwitch">
                                <input type="checkbox" checked="checked" v-on:click="toggleRankingSort">
                                <span class="categorySwitchSlider"></span>
                            </label>
                            <span class="categorySwitchLabel">
                                <span class="modalRankingPublicIcon"></span>
                            </span>
                        </div>
                    </div>
                    <div class="categoryNominationCards">
                        <div class="categoryNominationItem"
                            :data-public="nom.public"
                            :data-jury="nom.jury"
                            v-for="nom in nomPublicOrder"
                        >
                            <category-item-image
                                :nominee="nom"
                            />
                        </div>
                    </div>
                </div>
                <div class="awardHonorableMentions" v-if="award.hms">
                    <h4>Honorable Mentions</h4>
                    <ul>
                        <li v-for="hm in award.hms">{{hm}}</li>
                    </ul>
                </div>
            </div>
        </div>
    `
});
Vue.component('award-winners', {
    props: ['public','jury'],
    template: `
        <div
            v-if="public.jury === public.public"
            class="categoryWinnerContainer"
        >
            <div class="categoryWinnerItem categoryWinnerPublic categoryWinnerJury">
                <category-item-image
                    :nominee="public"
                />
            </div>
        </div>
        <div
            v-else
            class="categoryWinnerContainer"
        >
            <div class="categoryWinnerItem categoryWinnerJury">
                <category-item-image
                    :nominee="jury"
                />
            </div>
            <div class="categoryWinnerItem categoryWinnerPublic">
                <category-item-image
                    :nominee="public"
                />
            </div>
        </div>
    `
});
Vue.component('award-winners-label', {
    props: ['public','jury'],
    template: `
        <div class="categorySubHeadContainer" v-if="public.jury !== public.public">
            <div class="categorySubHeadItem categorySubHeadJury">
                <div class="categorySubHeadItemIcon">
                    <img alt="laurels" src="img/assets/jury.png" />
                </div>
                <div class="categorySubHeadItemText">
                    <div class="categorySubHeadItemTextTitle">
                        <nominee-name
                        :nominee="jury"
                        ></nominee-name>
                    </div>
                    <div class="categorySubHeadItemTextSubTitle">
                        Jury Winner
                    </div>
                </div>
            </div>
            <div class="categorySubHeadItem categorySubHeadPublic">
                <div class="categorySubHeadItemIcon">
                    <img alt="laurels" src="img/assets/public.png" />
                </div>
                <div class="categorySubHeadItemText">
                    <div class="categorySubHeadItemTextTitle">
                        <nominee-name
                        :nominee="public"
                        ></nominee-name>
                    </div>
                    <div class="categorySubHeadItemTextSubTitle">
                        Public Winner
                    </div>
                </div>
            </div>
        </div>
        <div class="categorySubHeadContainer" v-else>
            <div class="categorySubHeadItem categorySubHeadPublic categorySubHeadJury">
                <div class="categorySubHeadItemIcon">
                    <img alt="laurels" src="img/assets/pubjury.png" />
                </div>
                <div class="categorySubHeadItemText">
                    <div class="categorySubHeadItemTextTitle">
                        <nominee-name
                        :nominee="public"
                        ></nominee-name>
                    </div>
                    <div class="categorySubHeadItemTextSubTitle">
                        Consensus Winner
                    </div>
                </div>
            </div>
        </div>
        
    `
});
Vue.component('category-item-image', {
    props: ['nominee'],
    methods:{
        showWriteUp(){
            this.$root.showWriteUpModal(this.nominee);
        }
    },
    computed: {
        backgroundStyle() {
            if (this.nominee.altimg !== ""){
                return `background-image: url(img/${this.nominee.altimg})`;
            }
            else {
                return `background-image: url(img/${this.nominee.id}.jpg)`;
            }
        }
    },
    template: `
        <div class="categoryItemImage" :style="backgroundStyle" @click="showWriteUp">

        </div>
    `
});
Vue.component('modal', {
    props: ['show', 'nom'],
    methods: {
        close: function () {
            this.$emit('close');
        },
        getPrettyRank(rank){
            rank--;
            const ranks = ["Winner", "2nd Place", "3rd Place"];
            if (rank < 3){
                return ranks[rank];
            } else {
                return (rank + 1) + "th Place";
            }
        }
    },
    computed: {
        backgroundStyle() {
            if (this.nom.altimg !== ""){
                return `background-image: url(img/${this.nom.altimg})`;
            }
            else {
                return `background-image: url(img/${this.nom.id}.jpg)`;
            }
        }
    },
    template: `
         <transition name="modal">
            <div class="modalMask" @click="close" v-show="show">
                <div class="modalWrapper">
                    <div class="modalContainer" :style="backgroundStyle" @click.stop>
                        <div class="modalHeader">
                            <div class="modalHeaderImage" :style="backgroundStyle" >
                                
                            </div>
                        </div>
                        <div class="modalBody">
                            <h3 class="modalBodyTitle">
                                <nominee-name
                                    :nominee="nom"
                                >
                                </nominee-name>
                            </h3>
                            <div class="modalRankingContainer">
                                <div class="modalRankingJury">
                                    <span class="modalRankingJuryIcon"></span>Jury {{this.getPrettyRank(this.nom.jury)}}
                                </div>      
                                <div class="modalRankingPublic">
                                    <span class="modalRankingPublicIcon"></span>Community Choice {{this.getPrettyRank(this.nom.public)}}
                                </div>                                                  
                            </div>
                            <div class="modalBodyText" v-html="this.$root.getMarkDown(this.nom.writeup)">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    `
});
Vue.component('modal-category', {
    props: ['show', 'category'],
    methods: {
        close: function () {
            this.$emit('close');
        },
        getReddit(name){
            return "http://reddit.com" + name;
        }
    },
    template: `
         <transition name="modal">
            <div class="modalMask" @click="close" v-show="show">
                <div class="modalWrapper">
                    <div class="modalContainer" @click.stop>
                        <div class="modalBody">
                            <h3 class="modalBodyTitle">
                                {{category.name}}
                            </h3>
                            <div class="modalBodyText" v-if="this.category.blurb" v-html="this.$root.getMarkDown(this.category.blurb)">
                            </div>
                            <div class="modalBodyStats" v-if="this.category.table" v-html="this.$root.getMarkDown(this.category.table)">
                            </div>
                            <div class="modalBodyCredits">
                                <p>
                                    Jurors: 
                                    <span v-for="juror in this.category.jurors">
                                        <a :href="getReddit(juror)">{{juror}}, </a>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    `
});
Vue.component('nominee-name', {
    props: ['nominee'],
    template: `
        <span v-if="nominee.altname != ''">
            {{nominee.altname}}
        </span>
        <span v-else>
            {{this.$root.getTitle(nominee.id)}}
        </span>
    `
});
Vue.component('awards-footer', {
    template: `
        <footer>
			<h2><router-link :to="{ name: 'thanks'}">Special thanks to the mods, volunteers, and community of r/anime!</router-link></h2>
		</footer>
    `
});

const AwardsSplash = {
    template: `
        <div class="awardsSplashBody">
            <div id="awardTitle" class="awardTitleSplash">
                <img class="headerTitle" alt="/r/animeawards 2018" src="img/assets/titlecard-snooless.png" />
                <img class="headerIcon" alt="/r/animeawards 2018" src="img/assets/snoowink.gif" />
            </div>
            <div id="contentContainer" class="awardsSplashContent">
                <div class="awardsSplashContainer">
                    <router-link v-for="section in this.$root.sections" :to="{ name: 'section', params: { slug: section.slug }}">
                        <div class="awardsSplashItem">
                            <img class="awardsSplashImg" :alt="section.name" :src="section.icon"/>
                            <div class="awardsSplashTitle">
                                {{section.name}}
                            </div>
                        </div>
                    </router-link>
                </div>
                <div class="awardsWelcomeText">
                    <h1>Welcome!</h1>
                    <p>
                        Welcome, one and all, to the 2018 r/Anime Awards results! Over the past few months we've laid the groundwork for our annual selection of the best shows of the year. We've recruited our jurors, cruelly subjected them to innumerable episodes of anime, and simultaneously opened it up to you, the community of /r/anime. At long last, we present the fruits of our collective labor!
                    </p>
                    <p>
                        This site contains all of the info about the winners and rankings for the 27 award categories featured this year. These are separated into over-arching category groups: genre awards, character awards, production awards, and main awards. On each of these pages you will find the winner and runners-up for each category, as well as a slider with which you can compare the results of the community vote to the rankings awarded by the category's jury.
                    </p>
                    <p>
                        For more detailed result statistics and other info, click the name of the award.
                    </p>
                    <p>
                        To watch a copy of the livestream in which we revealed and discussed the results with guests, click <a href="https://www.twitch.tv/dr_jwilson">here</a>.
                    </p>
                    <p>
                        With any other comments or questions, contact us at redditanimeawards@gmail.com
                    </p>
                </div>
            </div>
        </div>        
    `
};

const AwardsFAQ = {
    template: `
        <div class="awardsSplashBody">
            <div id="contentContainer" class="awardsSplashContent">
                <div class="awardsWelcomeText">
                    <h1>Frequently Asked Questions</h1>
                    <p>
                        Welcome, one and all, to the 2018 r/Anime Awards results! Over the past few months we've laid the groundwork for our annual selection of the best shows of the year. We've recruited our jurors, cruelly subjected them to innumerable episodes of anime, and simultaneously opened it up to you, the community of /r/anime. At long last, we present the fruits of our collective labor!
                    </p>
                    <p>
                        This site contains all of the info about the winners and rankings for the 27 award categories featured this year. These are separated into over-arching category groups: genre awards, character awards, production awards, and main awards. On each of these pages you will find the winner and runners-up for each category, as well as a slider with which you can compare the results of the community vote to the rankings awarded by the category's jury.
                    </p>
                    <p>
                        For more detailed result statistics and other info, check out this [reddit thread].
                    </p>
                    <p>
                        To watch a copy of the livestream in which we revealed and discussed the results with guests, click [here].
                    </p>
                    <p>
                        For answers to commonly asked questions about our process, check out the [FAQ].
                    </p>
                    <p>
                        With any other comments or questions, contact us at redditanimeawards@gmail.com
                    </p>
                </div>
            </div>
        </div>        
    `
};

const AwardsThanks = {
    template: `
        <div class="awardsSplashBody">
            <div id="contentContainer" class="awardsSplashContent">
                <div class="awardsWelcomeText">
                    <h1>Special Thanks</h1>
                    <p>
                        Welcome, one and all, to the 2018 r/Anime Awards results! Over the past few months we've laid the groundwork for our annual selection of the best shows of the year. We've recruited our jurors, cruelly subjected them to innumerable episodes of anime, and simultaneously opened it up to you, the community of /r/anime. At long last, we present the fruits of our collective labor!
                    </p>
                    <p>
                        This site contains all of the info about the winners and rankings for the 27 award categories featured this year. These are separated into over-arching category groups: genre awards, character awards, production awards, and main awards. On each of these pages you will find the winner and runners-up for each category, as well as a slider with which you can compare the results of the community vote to the rankings awarded by the category's jury.
                    </p>
                    <p>
                        For more detailed result statistics and other info, check out this [reddit thread].
                    </p>
                    <p>
                        To watch a copy of the livestream in which we revealed and discussed the results with guests, click [here].
                    </p>
                    <p>
                        For answers to commonly asked questions about our process, check out the [FAQ].
                    </p>
                    <p>
                        With any other comments or questions, contact us at redditanimeawards@gmail.com
                    </p>
                </div>
            </div>
        </div>        
    `
};

const AwardsSection = {
    props: ['slug'],
    computed: {
        section (){
            for (let i = 0; i < this.$root.sections.length; i++){
                if (this.$root.sections[i].slug === this.slug){
                    return this.$root.sections[i];
                }
            }
            return null;
        }
    },
    template: `
        <div id="contentContainer">
            <p v-if="section === null">
                Section Invalid        
            </p>
            <awards-section v-else
                :section="section"
            >
            </awards-section>
        </div>
    `,
    watch: {
        '$route' (to, from) {
            // react to route changes...
        }
    }
};

const AwardsFull = {
    template: `
        <div id="contentContainer">
            <div id="awardTitle">
                <img class="headerTitle" alt="/r/animeawards 2018" src="img/assets/titlecard.jpg" />
            </div>
            <awards-section v-for="section in this.$root.sections"
                :section="section"
            >
            </awards-section>
        </div>
    `
}


const routes = [
    { path: '/', name: "home", component: AwardsSplash},
    { path: '/full', name: "full", component: AwardsFull},
    { path: '/faq', name: "faq", component: AwardsFAQ},
    { path: '/thanks', name: "thanks", component: AwardsThanks},
    { path: '/:slug', name: "section", component: AwardsSection, props: true }
];
const router = new VueRouter({
    routes // short for `routes: routes`
});
const app = new Vue({ // eslint-disable-line no-unused-vars
    router,
    el: '#animeawardsContainer',
    data: {
        showModal: false,
        showCategoryModal: false,
        activeNominee: {
            "id": 0,
            "altimg": "",
            "altname": "",
            "public": -1,
            "jury": -1,
            "writeup": ""
        },
        activeCategory: {
            "name": "",
            "link": "",
            "table": "",
            "blurb": "",
            "nominees": []
        },
        sections: null,
        cachedData: {
            anime: {},
            sections: {}
        }
    },
    methods: {
        slugify (text) {
            return text.toLowerCase().replace(/\s+/g, '-');
        },
        loadData (year) {
            year = '' + year; // Cache keys become strings, even if we pass a number
            console.log('Loading awards data from', year);
            if (this.cachedData[year]) {
                this.sections = this.cachedData.sections[year];
                this.anime = this.cachedData.anime[year];
                //console.log('Loaded data from cache');
                return;
            }
            this.sections = null; // prompts loader
            fetch(`data/${year}.json`).then(res => res.json()).then(data => {
                this.sections = this.cachedData.sections[year] = data.sections;
                this.anime = this.cachedData.anime[year] = data.anime;
                //console.log('Loaded data via fetch and wrote to cache');
            });
        },
        getTitle (id) {
            return this.anime[id];
        },
        showWriteUpModal(nom) {
            this.activeNominee = nom;
            this.showModal = true;
        },
        showCatModal(cat) {
            this.activeCategory = cat;
            this.showCategoryModal = true;
        },
        getMarkDown(txt){
            return MarkDownIt.render(txt);
        }
    },
    created () {
        //console.log('hi im created');
        this.loadData(2018);
    },
    template: `
        <div id="animeawardsContainer">
            <section-nav :sections="sections"/>
            <div id="awardYearNav">
            </div>
            <transition name="fade">
                <div v-if="!sections" class="contentLoading">
                    Loading ...
                </div>
                <router-view v-else>
                
                </router-view>
            </transition>
            <modal
                :show="showModal"
                :nom="activeNominee"
                @close="showModal = false"
            />
            <modal-category
                :show="showCategoryModal"
                :category="activeCategory"
                @close="showCategoryModal = false"
            />
            <awards-footer></awards-footer>
		</div>
	`
});