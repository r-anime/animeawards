Vue.component('section-nav', {
    props: ['sections'],
    methods: {
        linkFor (section) {
            return `#section-${this.$root.slugify(section.name.toLowerCase())}`;
        }
    },
    template: `
        <ul id="awardSectionNav">
            <li class="awardSectionNavLink" v-for="section in sections"><a :href="linkFor(section)">{{section.name}}</a></li>
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
                <h1 class="sectionHeader">{{section.name}}</h1>
                <p
                    v-if="typeof section.blurb === 'string'"
                    class="awardSectionBlurb"
                    v-html="section.blurb"
                />
                <p
                    v-else
                    v-for="blurb in section.blurb"
                    class="awardSectionBlurb"
                    v-html="blurb"
                />
            </div>
            <awards-category
                v-for="award in section.awards"
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
    template: `
        <div :id="slug" class="awardDisplay">
            <h2 class="categoryHeader">{{award.name}}</h2>
                <award-winners
                    :public="nomPublicOrder[0]"
                    :jury="nomJuryOrder[0]"
                />
                <award-winners-label
                    :public="nomPublicOrder[0]"
                    :jury="nomJuryOrder[0]"
                />
                <div class="categoryNominationContainer">
                    <div class="categorySwitchContainer">
                        <label class="categorySwitch">
                            <input type="checkbox">
                            <span class="categorySwitchSlider"></span>
                        </label>
                    </div>
                    <div class="categoryNominationCards">
                        <div class="categoryNominationItem"
                            v-for="nom in nomPublicOrder"
                        >
                            <category-item-image
                                :data-public="nom.public"
                                :data-jury="nom.jury"
                                :nominee="nom"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
});

Vue.component('award-winners', {
    props: ['public','jury'],
    template: `
        <div
            v-if="public.id == jury.id"
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
    computed: {
        publicNomName (){
            return this.$root.getTitle(this.public.id);
        },
        juryNomName (){
            return this.$root.getTitle(this.jury.id);
        }
    },
    template: `
        <div class="categorySubHeadContainer">
            <div class="categorySubHeadItem categorySubHeadJury">
                <div class="categorySubHeadItemIcon">
                    <img alt="laurels" src="img/assets/jury.png" />
                </div>
                <div class="categorySubHeadItemText">
                    <div class="categorySubHeadItemTextTitle">
                        {{juryNomName}}
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
                        {{publicNomName}}
                    </div>
                    <div class="categorySubHeadItemTextSubTitle">
                        Public Winner
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
            return `background-image: url(img/${this.nominee.id}.jpg)`;
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
            ranks = ["Winner", "2nd Place", "3rd Place"];
            if (rank < 3){
                return ranks[rank];
            } else {
                return (rank + 1) + "th Place";
            }
        }
    },
    computed: {
        nomName (){
            return this.$root.getTitle(this.nom.id);
        },
        backgroundStyle() {
            return `background-image: url(img/${this.nom.id}.jpg)`;
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
                            <h3 class="modalBodyTitle">{{nomName}}</h3>
                            <div class="modalRankingContainer">
                                <div class="modalRankingJury">
                                    <span class="modalRankingJuryIcon"></span>Jury {{this.getPrettyRank(this.nom.jury)}}
                                </div>      
                                <div class="modalRankingPublic">
                                    <span class="modalRankingPublicIcon"></span>Community Choice {{this.getPrettyRank(this.nom.public)}}
                                </div>                                                  
                            </div>
                            <p class="modalBodyText">
                                {{this.nom.writeup}}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    `
});

const app = new Vue({ // eslint-disable-line no-unused-vars
    el: '#animeawardsContainer',
    data: {
        showModal: false,
        activeNominee: {
            "id": 0,
            "altimg": "",
            "altname": "",
            "public": -1,
            "jury": -1,
            "writeup": ""
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
            console.log('Loading awards data from', year)
            if (this.cachedData[year]) {
                this.sections = this.cachedData.sections[year];
                this.anime = this.cachedData.anime[year];
                console.log('Loaded data from cache');
                return;
            }
            this.sections = null; // prompts loader
            fetch(`data/${year}.json`).then(res => res.json()).then(data => {
                this.sections = this.cachedData.sections[year] = data.sections;
                this.anime = this.cachedData.anime[year] = data.anime;
                console.log('Loaded data via fetch and wrote to cache');
            });
        },
        getTitle (id) {
            return this.anime[id];
        },
        showWriteUpModal(nom) {
            this.activeNominee = nom;
            this.showModal = true;
        }
    },
    created () {
        console.log('hi im created');
        this.loadData(2017);
    },
    template: `
        <div id="animeawardsContainer">
            <section-nav :sections="sections"/>
            <div id="awardYearNav">

            </div>
            <div id="awardTitle">
                <img class="headerIcon" alt="/r/animeawards 2018" src="img/assets/titlecard.jpg" />
            </div>
            <div id="contentContainer">
                <awards-section
                    v-for="section in sections"
                    :section="section"
                />
            </div>
            <modal
                :show="showModal"
                :nom="activeNominee"
                @close="showModal = false"
            />
		</div>
	`
});