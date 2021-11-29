const React = require('react');
require('./style.css');
const PropTypes = require('prop-types');
const { Glyphicon, Alert } = require('react-bootstrap');
const Dialog = require('@mapstore/components/misc/Dialog');
const Portal = require('@mapstore/components/misc/Portal');
const Message = require('@mapstore/plugins/locale/Message');

/**
 * Classe permettant l'affichage des résultats suite à une recherche FullText
 */
class SearchResultsList extends React.Component {
    static propTypes = {
        /**
         * Variables
         */
        searchFullText: PropTypes.object,
        /**
         * Functions
         */
        onClose: PropTypes.func,
        showElementSearch: PropTypes.func,
    };

    static defaultProps = {
        /**
         * Variables
         */
        searchFullText: {},
        /**
         * Functions
         */
        onClose: () => {},
        showElementSearch: () => {},
    };

    state = {
        /**
         * Erreur à afficher
         * @type {String}
         */
        error: undefined,
    };

    showMessage = (results) => {
        if (results <= 0) {
            return (
                <>
                    <Message msgId="search.es.noResults" />
                </>
            );
        } else {
            return (
                <>
                    <b>{results}</b> <Message msgId="search.es.results" />
                </>
            );
        }
    };

    /**
     * Affiche la liste des résultats de la recherche FullText
     */
    renderResults() {
        let elements = [];
        if (this.props.searchFullText.results && this.props.searchFullText.results.data) {
            this.props.searchFullText.results.data.hits.hits.forEach((element, key) => {
                elements.push(
                    <p key={`element-${key}`} className="results-list" onClick={() => this.props.showElementSearch(key)}>
                        <Glyphicon glyph={'map-marker'} /> {element._index} | {element._source.nom === ' ' ? element._id : element._source.nom}
                    </p>
                );
            });
        }
        return elements;
    }

    render() {
        if (this.props.searchFullText.results.show) {
            const elements = this.props.searchFullText.results.data.hits.total.value || 0;
            return (
                <Portal>
                    <Dialog id="mapstore-full-text-results-panel">
                        <div key="header" role="header" id="full-text-results-header">
                            <Glyphicon glyph="search" />
                            &nbsp; <Message msgId="search.es.title" />
                            <button key="close" onClick={this.props.onClose} className="close">
                                <Glyphicon glyph={'1-close'} />
                            </button>
                        </div>
                        <div key="body" className="panel-body" role="body">
                            <p>
                                {this.showMessage(elements)}
                            </p>
                            <div style={{ overflow: 'auto', maxHeight: '50vh' }}>{this.renderResults()}</div>
                            {this.state.error && (
                                <Alert bsStyle={'danger'}>
                                    <span>{this.state.error}</span>
                                </Alert>
                            )}
                        </div>
                    </Dialog>
                </Portal>
            );
        }

        return null;
    }
}

module.exports = SearchResultsList;
