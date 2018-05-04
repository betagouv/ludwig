export default () => <div>
  <h1>Ludwig !</h1>
  <h2>Faciliter la validation collaborative des applications</h2>
  <div>
    <style jsx>{`
      main .row {
          display: flex;
          justify-content: space-between;
      }

      #main .row:nth-of-type(2n) {
          background-color: lightgray;
      }
  `}</style>
    <div>
      <p><a href="/login/github" target="_self">Connectez vous sur GitHub</a> pour permettre à votre communauté de participer à l'amélioration de votre service&nbsp;!</p>
    </div>

    <div>
      <p>Bonjour <code>HELLO</code>, vous êtes identifié sur GitHub.</p>
      <button>Vous déconnecter</button>
    </div>

    <h3>Liste des dépôts pouvant être activés&nbsp;:</h3>
    <div>
      <div className="row repository">
        <div>
          repository.full_name
        </div>
        <button>
          Activer
        </button>
      </div>
    </div>
  </div>
</div>
